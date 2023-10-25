import { dqlQueryApiRef } from '../api';
import { useDqlQuery } from './useDqlQuery';
import { TestApiProvider } from '@backstage/test-utils';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';
import { renderHook } from '@testing-library/react-hooks';
import React, { ReactNode } from 'react';

const MockDqlQueryApi = {
  getData: jest.fn().mockResolvedValue([] as TabularData),
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestApiProvider apis={[[dqlQueryApiRef, MockDqlQueryApi]]}>
    {children}
  </TestApiProvider>
);

describe('usDqlQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delegate to dqlQueryApi and return the result of the query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useDqlQuery('namespace', 'queryName', 'component'),
      { wrapper },
    );

    await waitForNextUpdate();

    expect(MockDqlQueryApi.getData).toHaveBeenCalledWith(
      'namespace',
      'queryName',
      'component',
    );
    expect(result.current.value).toEqual([]);
  });

  it('should return loading true while the query is running', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useDqlQuery('namespace', 'queryName', 'component'),
      { wrapper },
    );

    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();
  });

  it('should return error if the query fails', async () => {
    const error = new Error('test');
    MockDqlQueryApi.getData.mockRejectedValue(error);

    const { result, waitForNextUpdate } = renderHook(
      () => useDqlQuery('namespace', 'queryName', 'component'),
      { wrapper },
    );

    await waitForNextUpdate();

    expect(result.current.error).toEqual(error);
  });
});
