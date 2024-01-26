/* Copyright [2024] [Dynatrace]
	 Licensed under the Apache License, Version 2.0 (the "License");
	 you may not use this file except in compliance with the License.
	 You may obtain a copy of the License at

		 http://www.apache.org/licenses/LICENSE-2.0

	 Unless required by applicable law or agreed to in writing, software
	 distributed under the License is distributed on an "AS IS" BASIS,
	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 See the License for the specific language governing permissions and
	 limitations under the License.*/
import { dqlQueryApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';

export const useDqlQuery = (
  namespace: string,
  queryName: string,
  componentName: string,
  componentNamespace: string,
) => {
  const dqlQueryApi = useApi(dqlQueryApiRef);

  const { value, loading, error } = useAsync(async () => {
    return await dqlQueryApi.getData(
      namespace,
      queryName,
      componentName,
      componentNamespace,
    );
  }, [dqlQueryApi, namespace, queryName, componentName, componentNamespace]);

  return {
    error,
    loading,
    value,
  };
};
