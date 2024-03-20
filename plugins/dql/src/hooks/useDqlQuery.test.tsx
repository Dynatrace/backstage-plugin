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
      () =>
        useDqlQuery(
          'queryNamespace',
          'queryName',
          'componentName',
          'componentNamespace',
        ),
      { wrapper },
    );

    await waitForNextUpdate();

    expect(MockDqlQueryApi.getData).toHaveBeenCalledWith<
      Parameters<DqlQueryApi['getData']>
    >(
      'queryNamespace',
      'queryName',
      'componentName',
      'componentNamespace',
      undefined,
      undefined,
    );
    expect(result.current.value).toEqual([]);
  });

  it('should return loading true while the query is running', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useDqlQuery(
          'queryNamespace',
          'queryName',
          'componentName',
          'componentNamespace',
        ),
      { wrapper },
    );

    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();
  });

  it('should return error if the query fails', async () => {
    const error = new Error('test');
    MockDqlQueryApi.getData.mockRejectedValue(error);

    const { result, waitForNextUpdate } = renderHook(
      () =>
        useDqlQuery(
          'queryNamespace',
          'queryName',
          'componentName',
          'componentNamespace',
        ),
      { wrapper },
    );

    await waitForNextUpdate();

    expect(result.current.error).toEqual(error);
  });
});
