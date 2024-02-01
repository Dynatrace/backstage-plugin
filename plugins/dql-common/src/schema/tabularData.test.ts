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
import { TabularDataFactory } from './tabularData';

const VALID_OBJECTS = [
  [], // Empty array
  [
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
  [
    // with Link
    {
      name: 'foo',
      namespace: 'bar',
      extra: { type: 'link', text: 'example.com', url: 'https://example.com' },
    },
  ],
];
const INVALID_OBJECTS = [
  [
    {
      name: 'some-name',
      extra: 'foo',
    },
    {
      extra: 'foo', // different structure (missing columns)
    },
  ],
  [
    {
      extra: { text: 'example.com', url: 'https://example.com' }, // missing type
    },
  ],
  { thisIsNotAcceptable: 'foo' }, // plain object
];

describe('TabularDataFactory', () => {
  describe('fromString', () => {
    it('parses valid input', () => {
      VALID_OBJECTS.forEach(validInput => {
        const input = JSON.stringify(validInput);

        const deployment = TabularDataFactory.fromString(input);

        expect(deployment).toEqual(validInput);
      });
    });

    it('throws on invalid inputs', () => {
      INVALID_OBJECTS.forEach(invalidInput => {
        const input = JSON.stringify(invalidInput);

        expect(() => TabularDataFactory.fromString(input)).toThrow();
      });
    });
  });

  describe('fromObject', () => {
    it('parses valid input', () => {
      VALID_OBJECTS.forEach(validInput => {
        const input = validInput;

        const deployment = TabularDataFactory.fromObject(input);

        expect(deployment).toEqual(validInput);
      });
    });

    it('throws on invalid inputs', () => {
      INVALID_OBJECTS.forEach(invalidInput => {
        expect(() => TabularDataFactory.fromObject(invalidInput)).toThrow();
      });
    });
  });
});
