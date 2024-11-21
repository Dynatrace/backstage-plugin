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
import { z } from 'zod';

export enum TableTypes {
  LINK = 'link',
  OBJECT = 'object',
}

const tableCell = z
  .string()
  .or(z.null().or(z.boolean()).or(z.number()).transform(String))
  .or(
    z.strictObject({
      type: z.literal(TableTypes.LINK),
      text: z.string(),
      url: z.string().url(),
    }),
  )
  .or(
    z
      .array(z.any())
      .or(z.object({}).passthrough())
      .transform(obj => ({
        type: TableTypes.OBJECT as const,
        content: JSON.stringify(obj, null, 2),
      })),
  );

const rowData = z.record(tableCell);
const tabularDataSchema = z.array(rowData);

export const TabularDataFactory = {
  fromString: (input: string): TabularData => {
    const data = JSON.parse(input);
    return TabularDataFactory.fromObject(data);
  },

  fromObject: (input: unknown) => {
    return tabularDataSchema.parse(input);
  },
};

export type TabularData = z.infer<typeof tabularDataSchema>;
export type TabularDataRow = z.infer<typeof rowData>;
export type TabularDataCell = z.infer<typeof tableCell>;
