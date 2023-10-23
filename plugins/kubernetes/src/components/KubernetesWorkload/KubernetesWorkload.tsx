import {
  Progress,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Deployment } from '@dynatrace/backstage-plugin-kubernetes-common';
import React from 'react';
import { useKubernetesWorkloadData } from '../../hooks/useKubernetesWorkloadData';

type DenseTableProps = {
  deployments: Deployment[];
};

export const DenseTable = ({ deployments }: DenseTableProps) => {
  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    { title: 'Namespace', field: 'namespace' },
  ];

  return (
    <Table
      title="Deployments"
      options={{ search: false, paging: false }}
      columns={columns}
      data={deployments}
    />
  );
};

export const KubernetesWorkload = () => {
  const { entity } = useEntity();
  const { error, loading, value } = useKubernetesWorkloadData();

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <>
      <div>
        Hello{' '}
        {entity.metadata.namespace ? entity.metadata.namespace : 'default'}/
        {entity.metadata.name}
      </div>
      <div>Status: {value?.status}</div>
      <DenseTable deployments={value?.data || []} />
    </>
  );
};
