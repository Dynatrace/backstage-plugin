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
import { DqlQueryApi, dqlQueryApiRef } from '../api';
import { useCatalogDqlQueries } from './useCatalogDqlQueries';
import { identityApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';
import { renderHook, waitFor } from '@testing-library/react';
import React, { ReactNode } from 'react';

const MockDqlQueryApi = {
  getDataFromQueries: jest.fn().mockResolvedValue([] as TabularData[]),
};
const MockIdentityApi = {
  getCredentials: jest.fn().mockResolvedValue({ token: 'mock-token' }),
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestApiProvider
    apis={[
      [dqlQueryApiRef, MockDqlQueryApi],
      [identityApiRef, MockIdentityApi],
    ]}
  >
    {children}
  </TestApiProvider>
);

const mockedEntityRef = 'component:default/example';

describe('useDqlQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delegate to dqlQueryApi and return the result of the query', async () => {
    const { result } = renderHook(
      () => useCatalogDqlQueries('queryNamespace', mockedEntityRef),
      { wrapper },
    );

    await waitFor(() => {
      expect(MockDqlQueryApi.getDataFromQueries).toHaveBeenCalledWith<
        Parameters<DqlQueryApi['getDataFromQueries']>
      >('queryNamespace', mockedEntityRef, expect.anything());
      expect(result.current.value).toEqual([]);
    });
  });

  it('should return loading true while the query is running', async () => {
    const { result } = renderHook(
      () => useCatalogDqlQueries('queryNamespace', mockedEntityRef),
      { wrapper },
    );

    expect(result.current.loading).toBeTruthy();

    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
    });
  });

  it('should return error if the query fails', async () => {
    const error = new Error('test');
    MockDqlQueryApi.getDataFromQueries.mockRejectedValue(error);

    const { result } = renderHook(
      () => useCatalogDqlQueries('queryNamespace', mockedEntityRef),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.error).toEqual(error);
    });
  });

  it('should return error if identity api fails to retrieve credentials', async () => {
    const error = new Error('Failed to get identity token');
    MockIdentityApi.getCredentials.mockResolvedValue({});

    const { result } = renderHook(
      () => useCatalogDqlQueries('queryNamespace', mockedEntityRef),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.error).toEqual(error);
    });
  });
});
