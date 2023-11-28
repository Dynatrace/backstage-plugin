import { DqlQuery } from '../DqlQuery';
import { KubernetesDeploymentsEmptyState } from './KubernetesDeploymentsEmptyState';
import React from 'react';

type KubernetesDeploymentsProps = {
  title?: string;
};

export const KubernetesDeployments = ({
  title = 'Kubernetes Deployments',
}: KubernetesDeploymentsProps) => {
  return (
    <DqlQuery
      title={title}
      queryId="dynatrace.kubernetes-deployments"
      emptyState={KubernetesDeploymentsEmptyState}
    />
  );
};
