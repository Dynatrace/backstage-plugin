import { TabularDataFactory } from './tabularData';

const VALID_OBJECT = [
  {
    name: 'foo',
    namespace: 'bar',
    extra: { type: 'link', text: 'example.com', url: 'https://example.com' },
  },
  {
    name: 'baz',
    namespace: 'qux',
    extra: { type: 'link', text: 'google.com', url: 'https://google.com' },
  },
];
const INVALID_OBJECTS = [
  [
    ...VALID_OBJECT,
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
      const input = JSON.stringify(VALID_OBJECT);

      const deployment = TabularDataFactory.fromString(input);

      expect(deployment).toEqual(VALID_OBJECT);
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
      const input = VALID_OBJECT;

      const deployment = TabularDataFactory.fromObject(input);

      expect(deployment).toEqual(VALID_OBJECT);
    });

    it('throws on invalid inputs', () => {
      INVALID_OBJECTS.forEach(invalidInput => {
        expect(() => TabularDataFactory.fromObject(invalidInput)).toThrow();
      });
    });
  });
});
