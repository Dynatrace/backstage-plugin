import { dqlQueryApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';

export const useDqlQuery = (component: string) => {
  const dqlQueryApi = useApi(dqlQueryApiRef);

  const getObjects = async () => await dqlQueryApi.getData(component);

  const { value, loading, error } = useAsync(getObjects);

  return {
    error,
    loading,
    value,
  };
};
