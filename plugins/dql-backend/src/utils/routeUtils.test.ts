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
import { getEntityFromRequest } from './routeUtils';
import { CatalogClient, CatalogApi } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';
import { Request } from 'express';

const mockedEntityRef = 'component:default/example';

describe('routeUtils', () => {
  const getRequest = (ref: string) => {
    return { query: { entityRef: ref } } as unknown as Request;
  };
  const getEntityByRefMock: jest.Mock<
    ReturnType<CatalogApi['getEntityByRef']>,
    Parameters<CatalogApi['getEntityByRef']>
  > = jest.fn();
  const mockedClient = {
    getEntityByRef: getEntityByRefMock,
  } as unknown as CatalogClient;

  beforeEach(() => {
    getEntityByRefMock.mockReset();

    getEntityByRefMock.mockResolvedValue({
      kind: 'component',
      apiVersion: '1.0.0',
      metadata: {
        name: 'myComp',
      },
    });
  });

  describe('getEntityFromRequest', () => {
    it('should fail the request if the entityRef is invalid', async () => {
      // act, assert
      await expect(() =>
        getEntityFromRequest(getRequest(''), mockedClient),
      ).rejects.toThrow('Invalid entity ref');
    });

    it('should fail the request returns undefined', async () => {
      // arrange
      getEntityByRefMock.mockResolvedValue(undefined);

      // act, assert
      await expect(() =>
        getEntityFromRequest(getRequest(mockedEntityRef), mockedClient),
      ).rejects.toThrow('Entity ref "component:default/example" not found');
    });

    it('should return the entity', async () => {
      // act
      const entity = await getEntityFromRequest(
        getRequest(mockedEntityRef),
        mockedClient,
      );

      // assert
      expect(entity).toEqual<Entity>({
        kind: 'component',
        apiVersion: '1.0.0',
        metadata: {
          name: 'myComp',
        },
      });
    });
  });
});
