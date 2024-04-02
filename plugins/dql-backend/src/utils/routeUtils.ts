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
import { CatalogClient } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';
import { Request } from 'express';

export const getEntityFromRequest = async (
  req: Request,
  client: CatalogClient,
): Promise<Entity> => {
  const entityRef = req.query?.entityRef;
  if (typeof entityRef !== 'string' || !entityRef) {
    throw new Error('Invalid entity ref');
  }
  const entity = await client.getEntityByRef(entityRef);
  if (!entity) {
    throw new Error(`Entity ref "${entityRef}" not found`);
  }
  return entity;
};
