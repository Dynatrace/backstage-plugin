import { useDqlQuery } from '../hooks/useDqlQuery';
import {
  Progress,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';
import _ from 'lodash';
import React from 'react';
import { z } from 'zod';

type DenseTableProps = {
  title: string;
  data: TabularData;
};

export const DenseTable = ({ title, data }: DenseTableProps) => {
  let columns: TableColumn[] = [];

  if (data.length !== 0) {
    const firstRow = data[0];
    columns = _.keys(firstRow).map(key => {
      return { title: key, field: key };
    });
  }

  return (
    <Table
      title={title}
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
    />
  );
};

const dqlQueryResultTableSchema = z.strictObject({
  title: z.string().default('Query Result'),
  queryId: z.string(),
});

type DqlQueryResultTableProps = z.infer<typeof dqlQueryResultTableSchema>;

export const DqlQueryResultTable = (props: DqlQueryResultTableProps) => {
  const { entity } = useEntity();
  const component = `${entity.metadata.name}.${
    entity.metadata.namespace ?? 'default'
  }`;
  const { error, loading, value } = useDqlQuery(component);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <DenseTable title={props.title} data={value || []} />;
};
