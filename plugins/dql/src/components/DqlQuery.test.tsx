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
import { DqlQuery } from './DqlQuery';
import { InternalDqlQuery } from './InternalDqlQuery';
import { renderInTestApp } from '@backstage/test-utils';
import React from 'react';

jest.mock('./InternalDqlQuery', () => ({
  InternalDqlQuery: jest.fn(() => null),
}));

type PrepareComponentProps = {
  title?: string;
  queryId?: string;
};

const prepareComponent = async ({
  title = 'some title',
  queryId = 'dynatrace.query-id-1',
}: PrepareComponentProps = {}) => {
  return await renderInTestApp(<DqlQuery title={title} queryId={queryId} />);
};

describe('DqlQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should parse props and split the queryId and call InternalDqlQuery', async () => {
    const title = 'some title';
    const queryId = 'dynatrace.query-id-1';
    await prepareComponent({ title, queryId });

    expect(InternalDqlQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        title,
        queryNamespace: 'dynatrace',
        queryName: 'query-id-1',
      }),
      expect.anything(),
    );
  });

  it('should show an informative error for bad queryIds', async () => {
    const queryIds = [
      'dyna-trace.query',
      'custom.!@#',
      'invalid',
      'invalid.1',
      'invalid.1.2',
    ];
    for (let i = 0; i < queryIds.length; i++) {
      const queryId = queryIds[i];
      const rendered = await prepareComponent({ queryId });

      expect(InternalDqlQuery).not.toHaveBeenCalled();

      const alerts = rendered.getAllByRole('alert');
      const containsInvalid = alerts.some(alert =>
        /queryId: String must be in the format 'namespace.query-name'. Namespace must be 'dynatrace' or 'custom'. Query name may only contain alphanumerics and dashes./.test(
          alert.textContent ?? '',
        ),
      );
      expect(containsInvalid).toBe(true);
    }
  });
});
