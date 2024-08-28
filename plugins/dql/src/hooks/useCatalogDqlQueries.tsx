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
import { dqlQueryApiRef } from '../api';
import { useApi, identityApiRef } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';

export const useCatalogDqlQueries = (namespace: string, entityRef: string) => {
  const dqlQueryApi = useApi(dqlQueryApiRef);
  const identityApi = useApi(identityApiRef);

  const { value, loading, error } = useAsync(async () => {
    const { token } = await identityApi.getCredentials();
    if (!token) {
      throw new Error(`Failed to get identity token`);
    }

    return await dqlQueryApi.getDataFromQueries(namespace, entityRef, token);
  }, [dqlQueryApi, namespace, entityRef]);

  return {
    error,
    loading,
    value,
  };
};
