import {
  EntityDqlQueryCard,
  EntityKubernetesDeploymentsCard,
  dqlQueryPlugin,
} from './plugin';

describe('dql', () => {
  it('should export the dqlQueryPlugin', () => {
    expect(dqlQueryPlugin).toBeDefined();
  });

  it('should export the EntityDqlQueryCard', () => {
    expect(EntityDqlQueryCard).toBeDefined();
  });

  it('should export the EntityKubernetesDeploymentsCard', () => {
    expect(EntityKubernetesDeploymentsCard).toBeDefined();
  });
});
