import { DqlQuery } from '../DqlQuery';
import { KubernetesDeploymentsEmptyState } from './KubernetesDeploymentsEmptyState';
import React from 'react';

type KubernetesDeploymentsProps = {
  title?: string;
  pageSize?: number;
};

export const KubernetesDeployments = ({
  title = 'Kubernetes Deployments',
  pageSize,
}: KubernetesDeploymentsProps) => {
  return (
    <DqlQuery
      title={title}
      queryId="dynatrace.kubernetes-deployments"
      emptyState={KubernetesDeploymentsEmptyState}
      pageSize={pageSize}
    />
  );
};
