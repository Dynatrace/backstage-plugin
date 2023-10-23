import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import { Deployment } from '@dynatrace/backstage-plugin-kubernetes-common';
import { Box } from '@material-ui/core';
import React, { FC } from 'react';
import { KubernetesWorkloadApi, kubernetesWorkloadApiRef } from '../src/api';
import { EntityKubernetesWorkloadCard, kubernetesPlugin } from '../src/plugin';
import { exampleData } from './data';

const mockComponentWithNamespace: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    // This component would map to Kubernetes workloads with the label
    // `backstage.io/component: backstage-example.hardening`.
    name: 'backstage-example',
    description: 'backstage.io/example',
    namespace: 'hardening',
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

const mockComponentDefaultNamespace: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    // This component would map to Kubernetes workloads with the label
    // `backstage.io/component: backstage-example-2.default`.
    name: 'backstage-example-2',
    description: 'backstage.io/example02',
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

class MockKubernetesWorkloadApi implements KubernetesWorkloadApi {
  async getHealth(): Promise<{ status: string }> {
    return { status: 'ok' };
  }

  async getData(): Promise<Deployment[]> {
    return exampleData;
  }

  getDeployments(_: string): Promise<Deployment[]> {
    return Promise.resolve([]);
  }
}

const DemoCard: FC<{ mockData: Entity }> = ({ mockData }) => {
  return (
    <Box m={4}>
      <EntityProvider entity={mockData}>
        <EntityKubernetesWorkloadCard />
      </EntityProvider>
    </Box>
  );
};

createDevApp()
  .registerPlugin(kubernetesPlugin)
  .addPage({
    element: (
      <TestApiProvider
        apis={[[kubernetesWorkloadApiRef, new MockKubernetesWorkloadApi()]]}
      >
        <DemoCard mockData={mockComponentWithNamespace} />
        <DemoCard mockData={mockComponentDefaultNamespace} />
      </TestApiProvider>
    ),
    title: 'Root Page',
    path: '/catalog/hardening/component/backstage-example',
  })
  .render();
