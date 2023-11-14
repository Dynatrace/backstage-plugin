import { useDqlQuery } from '../hooks';
import { TabularDataTable } from './TabularDataTable';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import React from 'react';

export type InternalDqlQueryProps = {
  title: string;
  queryNamespace: string;
  queryName: string;
};

export const InternalDqlQuery = ({
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
