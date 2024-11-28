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
import { TableTypes, TabularDataFactory } from './tabularData';

const VALID_OBJECTS = [
  {
    input: [], // Empty array
    output: [],
  },
  {
    input: [
      // Standard case
      {
        name: 'foo',
        namespace: 'bar',
      },
      {
        name: 'baz',
        namespace: 'qux',
      },
    ],
    output: [
      // Standard case
      {
        name: 'foo',
        namespace: 'bar',
      },
      {
        name: 'baz',
        namespace: 'qux',
      },
    ],
  },
  {
    input: [
      // with Link
      {
        name: 'foo',
        namespace: 'bar',
        extra: {
          type: 'link',
          text: 'example.com',
          url: 'https://example.com',
        },
      },
    ],
    output: [
      // with Link
      {
        name: 'foo',
        namespace: 'bar',
        extra: {
          type: 'link',
          text: 'example.com',
          url: 'https://example.com',
        },
      },
    ],
  },
  {
    input: [
      {
        name: 'some-name',
        extra: 'foo',
      },
      {
        extra: 'foo', // different structure (missing columns)
      },
    ],
    output: [
      {
        name: 'some-name',
        extra: 'foo',
      },
      {
        extra: 'foo', // different structure (missing columns)
      },
    ],
  },
  {
    input: [
      {
        extra: { text: 'example.com', url: 'https://example.com' }, // different objects
      },
    ],
    output: [
      {
        extra: {
          type: TableTypes.OBJECT,
          content: JSON.stringify(
            { text: 'example.com', url: 'https://example.com' },
            null,
            2,
          ),
        }, // different objects
      },
    ],
  },
  {
    input: [
      {
        string: 'a',
        number: 12,
        boolean: false,
        null: null,
        object: {
          property: {
            nested: 'abc',
          },
        },
      },
    ],
    output: [
      {
        string: 'a',
        number: '12',
        boolean: 'false',
        null: 'null',
        object: {
          type: TableTypes.OBJECT,
          content: JSON.stringify(
            {
              property: {
                nested: 'abc',
              },
            },
            null,
            2,
          ),
        },
      },
    ],
  },
  // different types
];
const INVALID_OBJECTS = [
  { thisIsNotAcceptable: 'foo' }, // plain object
];

describe('TabularDataFactory', () => {
  describe('fromString', () => {
    it.each(VALID_OBJECTS)(
      'parses valid input',
      ({ input: validInput, output }) => {
        const input = JSON.stringify(validInput);

        const deployment = TabularDataFactory.fromString(input);

        expect(deployment).toEqual(output);
      },
    );

    it.each(INVALID_OBJECTS)('throws on invalid inputs', invalidInput => {
      const input = JSON.stringify(invalidInput);

      expect(() => TabularDataFactory.fromString(input)).toThrow();
    });
  });

  describe('fromObject', () => {
    it.each(VALID_OBJECTS)('parses valid input', ({ input, output }) => {
      const deployment = TabularDataFactory.fromObject(input);

      expect(deployment).toEqual(output);
    });

    it.each(INVALID_OBJECTS)('throws on invalid inputs', invalidInput => {
      expect(() => TabularDataFactory.fromObject(invalidInput)).toThrow();
    });
  });
});
