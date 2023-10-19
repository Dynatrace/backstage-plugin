import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import React from 'react';
import { KubernetesWorkloadApi, kubernetesWorkloadApiRef } from '../src/api';
import { EntityKubernetesWorkloadCard, kubernetesPlugin } from '../src/plugin';
import { User } from '../src/types';
import { exampleUsers } from './data';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage-example',
    description: 'backstage.io/example',
    annotations: {
      'backstage.io/kubernetes-id': 'example.hardening',
    },
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

  async getData(): Promise<User[]> {
    return exampleUsers;
  }
}

createDevApp()
  .registerPlugin(kubernetesPlugin)
  .addPage({
    element: (
      <TestApiProvider
        apis={[[kubernetesWorkloadApiRef, new MockKubernetesWorkloadApi()]]}
      >
        <EntityProvider entity={mockEntity}>
          <EntityKubernetesWorkloadCard />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Root Page',
    path: '/catalog/hardening/component/backstage-example',
  })
  .render();
