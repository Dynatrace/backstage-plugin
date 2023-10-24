import { kubernetesWorkloadApiRef } from '../api';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';

export const useKubernetesWorkloadData = (component: string) => {
  const kubernetesWorkloadApi = useApi(kubernetesWorkloadApiRef);

  const getObjects = async () => await kubernetesWorkloadApi.getData(component);

  const { value, loading, error } = useAsync(getObjects);

  return {
    error,
    loading,
    value,
  };
};
