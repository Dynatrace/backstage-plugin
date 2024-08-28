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
import { Entity, EntityMeta } from '@backstage/catalog-model';
import { z } from 'zod';

const entityQuerySchema = z.object({
  /**
   * The id of the query.
   */
  id: z.string(),
  /**
   * The query itself.
   */
  query: z.string(),
  /**
   * The description of the query.
   */
  description: z.string().optional(),
  /**
   * The environments in which the query is executed.
   */
  environments: z.array(z.string()).optional(),
});
export const dynatraceCatalogQuerySchema = z.array(entityQuerySchema).min(1);
export type EntityQuery = z.infer<typeof entityQuerySchema>;
export type ExtendedEntityMetadata = EntityMeta & {
  dynatrace?: {
    queries: EntityQuery[];
  };
};
export type ExtendedEntity = Entity & {
  metadata: ExtendedEntityMetadata;
};
