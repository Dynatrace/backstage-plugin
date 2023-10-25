import { useDqlQuery } from '../hooks/useDqlQuery';
import { TabularDataTable } from './TabularDataTable';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import React from 'react';
import { z } from 'zod';

const namespaceSchema = z.enum(['dynatrace', 'custom']);
const queryNameSchema = z.string().regex(/^[a-z1-9\-]+$/);

const dqlQueryPropsSchema = z.strictObject({
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
          "String must be in the format 'namespace.query-name'. Namespace must be 'dynatrace' or 'custom'. Query name may only contain alphanumerics and dashes.",
      },
    ),
});

type DqlQueryProps = z.infer<typeof dqlQueryPropsSchema>;

export const DqlQuery = (props: DqlQueryProps) => {
  const { title, queryId } = dqlQueryPropsSchema.parse(props);
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

  return <TabularDataTable title={title} data={value || []} />;
};
