import { kubernetesPlugin } from './plugin';

describe('kubernetes', () => {
  it('should export plugin', () => {
    expect(kubernetesPlugin).toBeDefined();
  });
});
