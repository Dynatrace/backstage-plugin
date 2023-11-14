import { useDqlQuery } from '../hooks';
import { TabularDataTable } from './TabularDataTable';
import {
  ErrorPanel,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import React from 'react';
import { ZodError, z } from 'zod';

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

type InternalDqlQueryProps = {
  title: string;
  queryNamespace: string;
  queryName: string;
};

const InternalDqlQuery = ({
  title,
  queryNamespace,
  queryName,
}: InternalDqlQueryProps) => {
  const { entity } = useEntity();
  const componentName = entity.metadata.name;
  const componentNamespace = entity.metadata.namespace ?? 'default';
  const { error, loading, value } = useDqlQuery(
    queryNamespace,
    queryName,
    componentName,
    componentNamespace,
  );

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <TabularDataTable title={title} data={value || []} />;
};

export type DqlQueryProps = z.infer<typeof dqlQueryPropsSchema>;

export const DqlQuery = (props: DqlQueryProps) => {
  try {
    const { title, queryId } = dqlQueryPropsSchema.parse(props);
    const [queryNamespace, queryName] = queryId.split('.');
    return (
      <InternalDqlQuery
        title={title}
        queryNamespace={queryNamespace}
        queryName={queryName}
      />
    );
  } catch (e) {
    if (e instanceof ZodError) {
      const title = `${e.issues[0].path.join('.')}: ${e.issues[0].message}`;
      return <ErrorPanel error={e} title={title} />;
    } else if (e instanceof Error) {
      return <ErrorPanel error={e} />;
    }
    return <ErrorPanel error={new Error(`Unknown error: ${e}`)} />;
  }
};
