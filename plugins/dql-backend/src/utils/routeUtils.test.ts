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
import { getEntityFromRequest, validateQueries } from './routeUtils';
import { AuthService } from '@backstage/backend-plugin-api';
import { CatalogClient, CatalogApi } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';
import { ExtendedEntity } from '@dynatrace/backstage-plugin-dql-common';
import { Request } from 'express';

const mockedEntityRef = 'component:default/example';

const defaultNoneCredentials = {
  $$type: '@backstage/BackstageCredentials',
  principal: { type: 'none' },
} as unknown as Awaited<ReturnType<AuthService['getNoneCredentials']>>;

describe('routeUtils', () => {
  const getRequest = (ref: string, authorizationHeader?: string) => {
    return {
      query: { entityRef: ref },
      headers: authorizationHeader ? { authorization: authorizationHeader } : {},
    } as unknown as Request;
  };
  const getEntityByRefMock: jest.Mock<
    ReturnType<CatalogApi['getEntityByRef']>,
    Parameters<CatalogApi['getEntityByRef']>
  > = jest.fn();
  const mockedClient = {
    getEntityByRef: getEntityByRefMock,
  } as unknown as CatalogClient;

  const getPluginRequestTokenMock: jest.Mock<
    ReturnType<AuthService['getPluginRequestToken']>,
    Parameters<AuthService['getPluginRequestToken']>
  > = jest.fn().mockResolvedValue({ token: 'mock-token' });

  const getOwnServiceCredentialsMock: jest.Mock<
    ReturnType<AuthService['getOwnServiceCredentials']>,
    Parameters<AuthService['getOwnServiceCredentials']>
  > = jest.fn();

  const authenticateMock: jest.Mock<
    ReturnType<AuthService['authenticate']>,
    Parameters<AuthService['authenticate']>
  > = jest.fn();

  const getNoneCredentialsMock: jest.Mock<
    ReturnType<AuthService['getNoneCredentials']>,
    Parameters<AuthService['getNoneCredentials']>
  > = jest.fn();

  const mockedAuth = {
    getPluginRequestToken: getPluginRequestTokenMock,
    getOwnServiceCredentials: getOwnServiceCredentialsMock,
    authenticate: authenticateMock,
    getNoneCredentials: getNoneCredentialsMock,
  } as unknown as AuthService;

  beforeEach(() => {
    getEntityByRefMock.mockReset();
    authenticateMock.mockReset();
    getNoneCredentialsMock.mockReset();
    getNoneCredentialsMock.mockResolvedValue(defaultNoneCredentials);

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
        },
      });
    });

    it('should not use own service credentials for user-controlled entityRef resolution', async () => {
      const serviceCredentials = {
        subject: 'plugin:dynatrace-dql',
      } as unknown as Awaited<
        ReturnType<AuthService['getOwnServiceCredentials']>
      >;
      getOwnServiceCredentialsMock.mockResolvedValue(serviceCredentials);

      await getEntityFromRequest(
        getRequest(mockedEntityRef),
        mockedClient,
        mockedAuth,
      );

      expect(getPluginRequestTokenMock).not.toHaveBeenCalledWith(
        expect.objectContaining({
          onBehalfOf: serviceCredentials,
          targetPluginId: 'catalog',
        }),
      );
    });

    it('should authenticate the caller and use their credentials as onBehalfOf when Authorization header is present', async () => {
      const callerCredentials = {
        $$type: '@backstage/BackstageCredentials',
        principal: { type: 'user', userEntityRef: 'user:default/alice' },
      } as unknown as Awaited<ReturnType<AuthService['authenticate']>>;
      authenticateMock.mockResolvedValue(callerCredentials);

      await getEntityFromRequest(
        getRequest(mockedEntityRef, 'Bearer test-token-123'),
        mockedClient,
        mockedAuth,
      );

      expect(authenticateMock).toHaveBeenCalledWith('test-token-123');
      expect(getPluginRequestTokenMock).toHaveBeenCalledWith({
        onBehalfOf: callerCredentials,
        targetPluginId: 'catalog',
      });
    });

    it('should use getNoneCredentials as onBehalfOf when no Authorization header is present', async () => {
      await getEntityFromRequest(
        getRequest(mockedEntityRef),
        mockedClient,
        mockedAuth,
      );

      expect(authenticateMock).not.toHaveBeenCalled();
      expect(getNoneCredentialsMock).toHaveBeenCalled();
      expect(getPluginRequestTokenMock).toHaveBeenCalledWith({
        onBehalfOf: defaultNoneCredentials,
        targetPluginId: 'catalog',
      });
    });
  });

  describe('validateQueries', () => {
    it.each<ExtendedEntity>([
      {
        kind: 'component',
        apiVersion: '1.0.0',
        metadata: {
          name: '',
        },
      },
      {
        kind: 'component',
        apiVersion: '1.0.0',
        metadata: {
          name: '',
          // @ts-ignore
          dynatrace: {},
        },
      },
      {
        kind: 'component',
        apiVersion: '1.0.0',
        metadata: {
          name: '',
          dynatrace: {
            queries: [],
          },
        },
      },
      {
        kind: 'component',
        apiVersion: '1.0.0',
        metadata: {
          name: '',
          dynatrace: {
            queries: [
              // @ts-ignore
              {
                id: '',
              },
            ],
          },
        },
      },
    ])(
      'should throw if the queries are incorrect',
      // @ts-ignore - For some reason jest writes the type incorrectly
      (entity: ExtendedEntity) => {
        expect(() => validateQueries(entity)).toThrow();
      },
    );

    it('should not throw if the queries are valid', () => {
      // act
      const result = validateQueries({
        kind: 'component',
        apiVersion: '1.0.0',
        metadata: {
          name: '',
          dynatrace: {
            queries: [
              {
                id: 'id',
                query: 'query',
              },
            ],
          },
        },
      });

      // assert
      expect(result).toEqual([
        {
          id: 'id',
          query: 'query',
        },
      ]);
    });
  });
});
