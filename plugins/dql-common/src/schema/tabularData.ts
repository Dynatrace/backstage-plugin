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
function validate(data: TabularData): boolean {
  if (data.length === 0) return true;
  // ensure all rows have the same columns
  const keys = _.keys(data[0]);
  return data.every(item => _.isEqual(_.keys(item), keys));
}

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
