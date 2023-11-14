import { DqlQueryApi, dqlQueryApiRef } from '../api';
import { InternalDqlQuery } from './InternalDqlQuery';
import { TabularDataTable } from './TabularDataTable';
import { Entity } from '@backstage/catalog-model';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider, renderInTestApp } from '@backstage/test-utils';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';
import React from 'react';

jest.mock('./TabularDataTable', () => ({
  TabularDataTable: jest.fn(() => null),
}));

const mockEntity = (
  name: string = 'example',
  namespace: string | undefined = undefined,
): Entity => {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name,
      description: 'backstage.io/example',
      namespace,
    },
    spec: {
      lifecycle: 'production',
      type: 'service',
      owner: 'user:guest',
    },
  };
};

const mockDqlQueryApi = (data: TabularData = []) => {
  return {
    getData: jest.fn().mockResolvedValue(data),
  };
};

type PrepareComponentProps = {
  entity?: Entity;
  queryApi?: DqlQueryApi;
  title?: string;
  queryNamespace?: string;
  queryName?: string;
};

const prepareComponent = async ({
  entity = mockEntity(),
  queryApi = mockDqlQueryApi(),
  title = 'some title',
  queryNamespace = 'dynatrace',
  queryName = 'query-id-1',
}: PrepareComponentProps = {}) => {
  return await renderInTestApp(
    <EntityProvider entity={entity}>
      <TestApiProvider apis={[[dqlQueryApiRef, queryApi]]}>
        <InternalDqlQuery
          title={title}
          queryNamespace={queryNamespace}
          queryName={queryName}
        />
      </TestApiProvider>
    </EntityProvider>,
  );
};

describe('DqlQuery', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // We'll swallow the error messages from the component
    // eslint-disable-next-line no-console
    (console.error as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the TabularDataTable component', async () => {
    const title = 'some title';
    const data: TabularData = [];
    await prepareComponent({ title, queryApi: mockDqlQueryApi(data) });

    expect(TabularDataTable).toHaveBeenCalledWith(
      expect.objectContaining({
        title,
        data,
      }),
      expect.anything(),
    );
  });

  it('should call the api with the component and namespace', async () => {
    const queryApi = mockDqlQueryApi();
    const entity = mockEntity('component', 'namespace');
    await prepareComponent({ entity, queryApi });

    expect(queryApi.getData).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'component',
      'namespace',
    );
  });

  it('should fill in empty namespaces with default', async () => {
    const queryApi = mockDqlQueryApi();
    const entity = mockEntity('example', undefined);
    await prepareComponent({ entity, queryApi });

    expect(queryApi.getData).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'example',
      'default',
    );
  });
});
