/**
 * @license
 * Copyright 2024 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  AuthService,
  BackstageCredentials,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';
import {
  dynatraceCatalogQuerySchema,
  EntityQuery,
  ExtendedEntity,
} from '@dynatrace/backstage-plugin-dql-common';
import { Request } from 'express';

const extractBearerToken = (
  authorizationHeader: string | undefined,
): string | undefined => {
  if (typeof authorizationHeader !== 'string') {
    return undefined;
  }

  const [scheme, ...credentialsParts] = authorizationHeader.trim().split(/\s+/);
  if (!scheme || scheme.toLowerCase() !== 'bearer') {
    return undefined;
  }

  const token = credentialsParts.join(' ').trim();
  return token ? token : undefined;
};

const resolveCallerCredentials = async (
  req: Request,
  auth: AuthService,
): Promise<BackstageCredentials> => {
  const authorizationHeader = req.headers?.authorization;
  const requestToken = extractBearerToken(authorizationHeader);

  if (
    requestToken &&
    typeof (auth as Partial<AuthService>).authenticate === 'function'
  ) {
    return await auth.authenticate(requestToken);
  }

  if (typeof (auth as Partial<AuthService>).getNoneCredentials === 'function') {
    return await auth.getNoneCredentials();
  }

  return {
    $$type: '@backstage/BackstageCredentials',
    principal: { type: 'none' },
  };
};

export const getEntityFromRequest = async (
  req: Request,
  client: CatalogClient,
  auth: AuthService,
): Promise<Entity> => {
  const entityRef = req.query?.entityRef;
  if (typeof entityRef !== 'string' || !entityRef) {
    throw new Error('Invalid entity ref');
  }

  const callerCredentials = await resolveCallerCredentials(req, auth);

  const { token } = await auth.getPluginRequestToken({
    onBehalfOf: callerCredentials,
    targetPluginId: 'catalog',
  });
  if (!token) {
    throw new Error(`Failed to get catalog token`);
  }

  const entity = await client.getEntityByRef(entityRef, { token });
  if (!entity) {
    throw new Error(`Entity ref "${entityRef}" not found`);
  }
  return entity;
};

export const validateQueries = (
  extendedEntity: ExtendedEntity,
): EntityQuery[] => {
  const parsedQuery = dynatraceCatalogQuerySchema.safeParse(
    extendedEntity.metadata.dynatrace?.queries,
  );
  if (parsedQuery.error) {
    const zodError = parsedQuery.error.errors
      .map(
        error =>
          `"${error.message}" at metadata/dynatrace/queries/${error.path.join(
            '/',
          )}`,
      )
      .join('\n');
    throw new Error(`Invalid custom catalog queries.\n${zodError}`);
  }
  return parsedQuery.data;
};
