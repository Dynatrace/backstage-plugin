import {
  Deployment,
  DeploymentFactory,
} from '@dynatrace/backstage-plugin-kubernetes-common';

export const exampleData: Deployment[] = [
  {
    name: 'backstage',
    namespace: 'hardening',
  },
  {
    name: 'nginx',
    // default namespace
  },
].map(deployment => DeploymentFactory.fromObject(deployment));
