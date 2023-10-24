import { useKubernetesWorkloadData } from '../../hooks/useKubernetesWorkloadData';
import {
  Progress,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { TabularData } from '@dynatrace/backstage-plugin-kubernetes-common';
import _ from 'lodash';
import React from 'react';

type DenseTableProps = {
  data: TabularData;
};

export const DenseTable = ({ data }: DenseTableProps) => {
  let columns: TableColumn[] = [];

  if (data.length !== 0) {
    const firstRow = data[0];
    columns = _.keys(firstRow).map(key => {
      return { title: key, field: key };
    });
  }

  return (
    <Table
      title="Deployments"
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
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

  return <DenseTable data={value || []} />;
};
