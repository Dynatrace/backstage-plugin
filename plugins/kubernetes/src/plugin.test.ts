import { dqlQueryPlugin } from './plugin';

describe('kubernetes', () => {
  it('should export plugin', () => {
    expect(dqlQueryPlugin).toBeDefined();
  });
});
