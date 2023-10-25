import { DqlQueryApi, dqlQueryApiRef } from '../api';
import { useDqlQuery } from './useDqlQuery';
import { TestApiProvider } from '@backstage/test-utils';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';
import { renderHook } from '@testing-library/react-hooks';
import React, { ReactNode } from 'react';

class MockDqlQueryApi implements DqlQueryApi {
  async getData(): Promise<TabularData> {
    return [];
  }
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestApiProvider apis={[[dqlQueryApiRef, new MockDqlQueryApi()]]}>
    {children}
  </TestApiProvider>
);

describe('usDqlQuery', () => {
  it('should return the result of the query', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useDqlQuery('namespace', 'queryName', 'component'),
      { wrapper },
    );

    expect(result.current).toEqual({
      error: undefined,
      loading: true,
      value: undefined,
    });

    await waitForNextUpdate();

    expect(result.current).toEqual({
      error: undefined,
      loading: false,
      value: [],
    });
  });
});
