import { useKubernetesWorkloadData } from '../../hooks/useKubernetesWorkloadData';
import {
  Progress,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Deployment } from '@dynatrace/backstage-plugin-kubernetes-common';
import React from 'react';

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
  const component = `${entity.metadata.name}.${
    entity.metadata.namespace ?? 'default'
  }`;
  const { error, loading, value } = useKubernetesWorkloadData(component);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <>
      <div>Hello {component}</div>
      <div>Status: {value?.status}</div>
      <DenseTable deployments={value?.deployments || []} />
    </>
  );
};
