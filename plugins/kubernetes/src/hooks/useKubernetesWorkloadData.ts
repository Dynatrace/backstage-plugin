import { useApi } from '@backstage/core-plugin-api';
import { useEffect, useState } from 'react';
import { kubernetesWorkloadApiRef } from '../api';

export const useKubernetesWorkloadData = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const kubernetesWorkloadApi = useApi(kubernetesWorkloadApiRef);
  const getObjects = async () => {
    try {
      const health = await kubernetesWorkloadApi.getHealth();
      setStatus(health.status);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getObjects();
  });
  return {
    error,
    loading,
    status,
  };
};
