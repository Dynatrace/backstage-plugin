import { dqlQueryApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';

export const useDqlQuery = (
  namespace: string,
  queryName: string,
  component: string,
) => {
  const dqlQueryApi = useApi(dqlQueryApiRef);

  const { value, loading, error } = useAsync(async () => {
    return await dqlQueryApi.getData(namespace, queryName, component);
  }, [dqlQueryApi, namespace, queryName, component]);

  return {
    error,
    loading,
    value,
  };
};
