import { DqlQueryApi, dqlQueryApiRef } from '../src/api';
import { EntityDqlQueryCard, dqlQueryPlugin } from '../src/plugin';
import { exampleData } from './data';
import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';
import { Box } from '@material-ui/core';
import React from 'react';

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

class MockDqlQueryApi implements DqlQueryApi {
  async getData(): Promise<TabularData> {
    return exampleData;
  }
}

type DemoCardProps = {
  mockData: Entity;
  title: string;
  queryId: string;
};

const DemoCard = ({ mockData, title, queryId }: DemoCardProps) => {
  return (
    <Box m={4}>
      <EntityProvider entity={mockData}>
        <EntityDqlQueryCard title={title} queryId={queryId} />
      </EntityProvider>
    </Box>
  );
};

createDevApp()
  .registerPlugin(dqlQueryPlugin)
  .addPage({
    element: (
      <TestApiProvider apis={[[dqlQueryApiRef, new MockDqlQueryApi()]]}>
        <DemoCard
          title="Some Deployments"
          queryId="dynatrace.kubernetes-deployments"
          mockData={mockComponentWithNamespace}
        />
        <DemoCard
          title="Other Deployments"
          queryId="dynatrace.kubernetes-deployments"
          mockData={mockComponentDefaultNamespace}
        />
      </TestApiProvider>
    ),
    title: 'Root Page',
    path: '/catalog/hardening/component/backstage-example',
  })
  .render();
