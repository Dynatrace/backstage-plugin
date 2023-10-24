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

const namespaceSchema = z.enum(['dynatrace', 'custom']);
const queryNameSchema = z.string().regex(/^[a-z\-]+$/);

const dqlQueryResultTableSchema = z.strictObject({
  title: z.string().default('Query Result'),
  queryId: z
    .string()
    .toLowerCase()
    .refine(
      value => {
        // Check the namespace and queryName separately
        const [namespace, queryName] = value.split('.');
        return (
          namespaceSchema.safeParse(namespace).success &&
          queryNameSchema.safeParse(queryName).success
        );
      },
      {
        message:
          "String must be in the format 'namespace.query-name'. Namespace must be 'dynatrace' or 'custom'. Query name must be lowercase and may only contain letters and dashes.",
      },
    ),
});

type DqlQueryResultTableProps = z.infer<typeof dqlQueryResultTableSchema>;

export const DqlQueryResultTable = (props: DqlQueryResultTableProps) => {
  const { title, queryId } = dqlQueryResultTableSchema.parse(props);
  const [namespace, queryName] = queryId.split('.');

  const { entity } = useEntity();
  const component = `${entity.metadata.name}.${
    entity.metadata.namespace ?? 'default'
  }`;
  const { error, loading, value } = useDqlQuery(
    namespace,
    queryName,
    component,
  );

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <DenseTable title={title} data={value || []} />;
};
