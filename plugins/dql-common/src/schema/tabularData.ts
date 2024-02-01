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
import _ from 'lodash';
import { z } from 'zod';

const tableCell = z.string().or(
  z.strictObject({
    type: z.literal('link'),
    text: z.string(),
    url: z.string().url(),
  }),
);

const rowData = z.record(tableCell);

const tabularDataSchema = z.array(rowData);

/**
 * Check if all rows have the same columns
 *
 * @param data TabularData to validate
 * @returns true if all elements of the array have the same keys, false otherwise
 */
const validate = (data: TabularData): boolean => {
  if (data.length === 0) return true;
  // ensure all rows have the same columns
  const keys = _.keys(data[0]);
  return data.every(item => _.isEqual(_.keys(item), keys));
};

export const TabularDataFactory = {
  fromString: (input: string): TabularData => {
    const data = JSON.parse(input);
    return TabularDataFactory.fromObject(data);
  },

  fromObject: (input: unknown) => {
    const tabularData = tabularDataSchema.parse(input);
    if (!validate(tabularData)) {
      throw new Error('Invalid tabular data');
    }
    return tabularData;
  },
};

export type TabularData = z.infer<typeof tabularDataSchema>;
export type TabularDataRow = z.infer<typeof rowData>;
export type TabularDataCell = z.infer<typeof tableCell>;
