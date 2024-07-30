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
import { AuthService } from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';
import { Request } from 'express';

export const getEntityFromRequest = async (
  req: Request,
  client: CatalogClient,
  auth: AuthService,
): Promise<Entity> => {
  const entityRef = req.query?.entityRef;
  if (typeof entityRef !== 'string' || !entityRef) {
    throw new Error('Invalid entity ref');
  }

  const { token } = await auth.getPluginRequestToken({
    onBehalfOf: await auth.getOwnServiceCredentials(),
    targetPluginId: 'catalog',
  });
  if (!token) {
    throw new Error(`Failed to get service token`);
  }

  const entity = await client.getEntityByRef(entityRef, { token });
  if (!entity) {
    throw new Error(`Entity ref "${entityRef}" not found`);
  }
  return entity;
};

const NOTEBOOK_URL_ANNOTATION = 'dynatrace.com/notebook-url';
const NOTEBOOK_ID_ANNOTATION = 'dynatrace.com/notebook-id';

export const getNotebookVariables = (entity: Entity) => {
  const annotationNotebookURL =
    entity.metadata.annotations?.[NOTEBOOK_URL_ANNOTATION] ?? '';

  if (!annotationNotebookURL) {
    return {
      notebookId: getNotebookId(
        '',
        entity.metadata.annotations?.[NOTEBOOK_ID_ANNOTATION],
      ),
      notebookHost: '',
    };
  }

  const notebookURL = new URL(annotationNotebookURL);
  const trimmedPathname = getTrimmedPathname(notebookURL.pathname);

  return {
    notebookId: getNotebookId(
      trimmedPathname,
      entity.metadata.annotations?.[NOTEBOOK_ID_ANNOTATION],
    ),
    notebookHost: notebookURL.origin,
  };
};

const getTrimmedPathname = (pathname: string) =>
  pathname.endsWith('/') ? pathname.slice(0, -1) : pathname; // remove the trailing slash

const getNotebookId = (pathname: string, id?: string) =>
  pathname ? pathname.split('/').pop() ?? '' : id ?? '';
