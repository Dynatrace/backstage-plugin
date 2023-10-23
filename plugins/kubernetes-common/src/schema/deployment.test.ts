import { fromObject, fromString } from './deployment';

const VALID_OBJECT = { name: 'foo', namespace: 'bar' };
const VALID_OBJECT_DEFAULT_FIELDS = { name: 'foo' };
const VALID_OJBECT_EXTRA_FIELDS = {
  name: 'foo',
  namespace: 'bar',
  extra: 'baz',
};
const INVALID_OBJECT = { thisIsNotAcceptable: 'foo' };

describe('fromString', () => {
  it('parses valid input', () => {
    const input = JSON.stringify(VALID_OBJECT);

    const deployment = fromString(input);

    expect(deployment.name).toBe('foo');
    expect(deployment.namespace).toBe('bar');
  });

  it('parses valid input with extra fields', () => {
    const input = JSON.stringify(VALID_OJBECT_EXTRA_FIELDS);

    const deployment = fromString(input);

    expect(deployment.name).toBe('foo');
    expect(deployment.namespace).toBe('bar');
  });

  it('parses valid input with default values', () => {
    const input = JSON.stringify(VALID_OBJECT_DEFAULT_FIELDS);

    const deployment = fromString(input);

    expect(deployment.name).toBe('foo');
    expect(deployment.namespace).toBe('default'); // default value
  });

  it('throws on invalid input', () => {
    const input = JSON.stringify(INVALID_OBJECT);

    expect(() => fromString(input)).toThrow();
  });
});

describe('fromObject', () => {
  it('parses valid input', () => {
    const input = VALID_OBJECT;

    const deployment = fromObject(input);

    expect(deployment.name).toBe('foo');
    expect(deployment.namespace).toBe('bar');
  });

  it('parses valid input with extra fields', () => {
    const input = VALID_OJBECT_EXTRA_FIELDS;

    const deployment = fromObject(input);

    expect(deployment.name).toBe('foo');
    expect(deployment.namespace).toBe('bar');
  });

  it('parses valid input with default values', () => {
    const input = VALID_OBJECT_DEFAULT_FIELDS;

    const deployment = fromObject(input);

    expect(deployment.name).toBe('foo');
    expect(deployment.namespace).toBe('default'); // default value
  });

  it('throws on invalid input', () => {
    const input = INVALID_OBJECT;

    expect(() => fromObject(input)).toThrow();
  });
});
