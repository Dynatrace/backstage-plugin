import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import React from 'react';
import { EntityKubernetesWorkload, kubernetesPlugin } from '../src/plugin';

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

createDevApp()
  .registerPlugin(kubernetesPlugin)
  .addPage({
    element: (
      <EntityProvider entity={mockEntity}>
        <EntityKubernetesWorkload />
      </EntityProvider>
    ),
    title: 'Root Page',
    path: '/catalog/hardening/component/backstage-example',
  })
  .render();
