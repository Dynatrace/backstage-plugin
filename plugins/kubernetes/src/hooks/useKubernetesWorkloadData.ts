import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { kubernetesWorkloadApiRef } from '../api';

export const useKubernetesWorkloadData = () => {
  const kubernetesWorkloadApi = useApi(kubernetesWorkloadApiRef);

  const getObjects = async () => {
    const health = await kubernetesWorkloadApi.getHealth();
    const data = await kubernetesWorkloadApi.getData();

    return {
      status: health.status,
      data,
    };
  };

  const { value, loading, error } = useAsync(getObjects);

  return {
    error,
    loading,
    value,
  };
};
