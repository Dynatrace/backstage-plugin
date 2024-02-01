/**
 * @license
 * Copyright 2024 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  EntityDqlQueryCard,
  EntityKubernetesDeploymentsCard,
  dqlQueryPlugin,
} from '../src';
import { DqlQueryApi, dqlQueryApiRef } from '../src/api';
import { exampleData } from './data';
import { Entity } from '@backstage/catalog-model';
import { TabbedLayout } from '@backstage/core-components';
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
    // `backstage.io/component: hardening.backstage-example`.
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

class MockDqlQueryApiNoResult implements DqlQueryApi {
  async getData(): Promise<TabularData> {
    return [];
  }
}

class MockDqlQueryApiError implements DqlQueryApi {
  async getData(): Promise<TabularData> {
    throw new Error('404 Not Found');
  }
}

type DqlCardProps = {
  mockData: Entity;
  title: string;
  queryId: string;
};

const DqlCard = ({ mockData, title, queryId }: DqlCardProps) => {
  return (
    <Box m={4}>
      <EntityProvider entity={mockData}>
        <EntityDqlQueryCard title={title} queryId={queryId} />
      </EntityProvider>
    </Box>
  );
};

type KubernetesCardProps = {
  mockData: Entity;
  title?: string;
};

const KubernetesCard = ({ mockData, title }: KubernetesCardProps) => {
  return (
    <Box m={4}>
      <EntityProvider entity={mockData}>
        <EntityKubernetesDeploymentsCard title={title} />
      </EntityProvider>
    </Box>
  );
};

createDevApp()
  .registerPlugin(dqlQueryPlugin)
  .addPage({
    element: (
      <TabbedLayout>
        <TabbedLayout.Route path="/examples" title="Examples">
          <>
            <TestApiProvider apis={[[dqlQueryApiRef, new MockDqlQueryApi()]]}>
              <DqlCard
                title="Some Deployments"
                queryId="dynatrace.kubernetes-deployments"
                mockData={mockComponentWithNamespace}
              />
              <DqlCard
                title="Other Deployments"
                queryId="dynatrace.kubernetes-deployments"
                mockData={mockComponentDefaultNamespace}
              />
            </TestApiProvider>
          </>
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/errors" title="Error Cases">
          <>
            <DqlCard
              title="Misconfigured Query"
              queryId="bad.query"
              mockData={mockComponentWithNamespace}
            />
            <TestApiProvider
              apis={[[dqlQueryApiRef, new MockDqlQueryApiError()]]}
            >
              <DqlCard
                title="404 from API"
                queryId="dynatrace.non-existent-query"
                mockData={mockComponentWithNamespace}
              />
            </TestApiProvider>
          </>
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/empty" title="Empty States">
          <>
            <TestApiProvider
              apis={[[dqlQueryApiRef, new MockDqlQueryApiNoResult()]]}
            >
              <DqlCard
                title="Empty State"
                queryId="dynatrace.kubernetes-deployments"
                mockData={mockComponentWithNamespace}
              />
            </TestApiProvider>
          </>
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/kubernetes" title="Kubernetes Card">
          <>
            <TestApiProvider apis={[[dqlQueryApiRef, new MockDqlQueryApi()]]}>
              <KubernetesCard mockData={mockComponentWithNamespace} />
            </TestApiProvider>
            <TestApiProvider apis={[[dqlQueryApiRef, new MockDqlQueryApi()]]}>
              <KubernetesCard
                title="Another list of deployments"
                mockData={mockComponentWithNamespace}
              />
            </TestApiProvider>
          </>
        </TabbedLayout.Route>
        <TabbedLayout.Route
          path="/kubernetes-empty"
          title="Kubernetes Card Empty"
        >
          <TestApiProvider
            apis={[[dqlQueryApiRef, new MockDqlQueryApiNoResult()]]}
          >
            <KubernetesCard mockData={mockComponentWithNamespace} />
          </TestApiProvider>
        </TabbedLayout.Route>
      </TabbedLayout>
    ),
    title: 'Root Page',
    path: '/catalog/hardening/component/backstage-example',
  })
  .render();
