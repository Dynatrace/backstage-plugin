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
import { getEntityFromRequest, getNotebookVariables } from './routeUtils';
import { AuthService } from '@backstage/backend-plugin-api';
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

  const getPluginRequestTokenMock: jest.Mock<
    Awaited<ReturnType<AuthService['getPluginRequestToken']>>
  > = jest.fn().mockResolvedValue({ token: 'mock-token' });

  const getOwnServiceCredentialsMock: jest.Mock<
    Awaited<ReturnType<AuthService['getOwnServiceCredentials']>>
  > = jest.fn();
  const mockedAuth = {
    getPluginRequestToken: getPluginRequestTokenMock,
    getOwnServiceCredentials: getOwnServiceCredentialsMock,
  } as unknown as AuthService;

  beforeEach(() => {
    getEntityByRefMock.mockReset();

    getEntityByRefMock.mockResolvedValue({
      kind: 'component',
      apiVersion: '1.0.0',
      metadata: {
        name: 'myComp',
        annotations: {
          'dynatrace.com/notebook-url':
            'https://my-environment.dynatrace.com/ui/apps/dynatrace.notebooks/notebook/my-notebook-id',
        },
      },
    });
  });

  describe('getEntityFromRequest', () => {
    it('should fail the request if the entityRef is invalid', async () => {
      // act, assert
      await expect(() =>
        getEntityFromRequest(getRequest(''), mockedClient, mockedAuth),
      ).rejects.toThrow('Invalid entity ref');
    });

    it('should fail the request returns undefined', async () => {
      // arrange
      getEntityByRefMock.mockResolvedValue(undefined);

      // act, assert
      await expect(() =>
        getEntityFromRequest(
          getRequest(mockedEntityRef),
          mockedClient,
          mockedAuth,
        ),
      ).rejects.toThrow('Entity ref "component:default/example" not found');
    });

    it('should return the entity', async () => {
      // act
      const entity = await getEntityFromRequest(
        getRequest(mockedEntityRef),
        mockedClient,
        mockedAuth,
      );

      // assert
      expect(entity).toEqual<Entity>({
        kind: 'component',
        apiVersion: '1.0.0',
        metadata: {
          name: 'myComp',
          annotations: {
            'dynatrace.com/notebook-url':
              'https://my-environment.dynatrace.com/ui/apps/dynatrace.notebooks/notebook/my-notebook-id',
          },
        },
      });
    });
  });
  describe('getNotebookVariables', () => {
    it('should split the notebook url in id and host', async () => {
      // act
      const entity = await getEntityFromRequest(
        getRequest(mockedEntityRef),
        mockedClient,
        mockedAuth,
      );

      const notebookVariables = getNotebookVariables(entity);

      // assert
      expect(entity).toEqual<Entity>({
        kind: 'component',
        apiVersion: '1.0.0',
        metadata: {
          name: 'myComp',
          annotations: {
            'dynatrace.com/notebook-url':
              'https://my-environment.dynatrace.com/ui/apps/dynatrace.notebooks/notebook/my-notebook-id',
          },
        },
      });

      expect(notebookVariables).toEqual({
        notebookId: 'my-notebook-id',
        notebookHost: 'https://my-environment.dynatrace.com',
      });
    });

    it('should return the notebook id', async () => {
      // act
      const entity: Entity = {
        kind: 'component',
        apiVersion: '1.0.0',
        metadata: {
          name: 'myComp',
          annotations: {
            'dynatrace.com/notebook-id': 'my-notebook-id',
          },
        },
      };
      const notebookVariables = getNotebookVariables(entity);
      // assert
      expect(notebookVariables).toEqual({
        notebookId: 'my-notebook-id',
        notebookHost: '',
      });
    });

    it('should remove a trailing slash', async () => {
      // act
      const entity: Entity = {
        kind: 'component',
        apiVersion: '1.0.0',
        metadata: {
          name: 'myComp',
          annotations: {
            'dynatrace.com/notebook-url':
              'https://my-environment.dynatrace.com/ui/apps/dynatrace.notebooks/notebook/my-notebook-id/',
          },
        },
      };
      const notebookVariables = getNotebookVariables(entity);
      // assert
      expect(notebookVariables.notebookId).toEqual('my-notebook-id');
    });
  });
});
