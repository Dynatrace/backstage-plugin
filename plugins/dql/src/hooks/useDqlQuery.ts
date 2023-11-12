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
