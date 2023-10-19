import { Progress } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import React from 'react';
import { useKubernetesWorkloadData } from '../../hooks/useKubernetesWorkloadData';

export const KubernetesWorkload = () => {
  const { entity } = useEntity();
  const { error, loading, status } = useKubernetesWorkloadData();

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <div>Error</div>;
  }

  return (
    <>
      <div>Hello {entity.metadata.name}</div>
      <div>Status: {status}</div>
    </>
  );
};
