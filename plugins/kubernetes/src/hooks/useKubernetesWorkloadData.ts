import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { kubernetesWorkloadApiRef } from '../api';

export const useKubernetesWorkloadData = (component: string) => {
  const kubernetesWorkloadApi = useApi(kubernetesWorkloadApiRef);

  const getObjects = async () => {
    const health = await kubernetesWorkloadApi.getHealth();
    const deployments = await kubernetesWorkloadApi.getDeployments(component);

    return {
      status: health.status,
      deployments,
    };
  };

  const { value, loading, error } = useAsync(getObjects);

  return {
    error,
    loading,
    value,
  };
};
