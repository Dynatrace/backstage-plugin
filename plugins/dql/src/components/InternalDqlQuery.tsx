import { useDqlQuery } from '../hooks';
import { DqlEmptyState } from './DqlEmptyState';
import { TabularDataTable } from './TabularDataTable';
import { EmptyStateProps } from './types';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import React from 'react';

export type InternalDqlQueryProps = {
  title: string;
  queryNamespace: string;
  queryName: string;
  EmptyState?: React.ComponentType<EmptyStateProps>;
};

export const InternalDqlQuery = ({
  title,
  queryNamespace,
  queryName,
  EmptyState = DqlEmptyState,
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

  if (!value || value.length === 0) {
    return (
      <EmptyState
        componentName={componentName}
        componentNamespace={componentNamespace}
        queryName={queryName}
        queryNamespace={queryNamespace}
      />
    );
  }

  return <TabularDataTable title={title} data={value} />;
};
