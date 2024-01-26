/* Copyright [2024] [Dynatrace]
	 Licensed under the Apache License, Version 2.0 (the "License");
	 you may not use this file except in compliance with the License.
	 You may obtain a copy of the License at

		 http://www.apache.org/licenses/LICENSE-2.0

	 Unless required by applicable law or agreed to in writing, software
	 distributed under the License is distributed on an "AS IS" BASIS,
	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 See the License for the specific language governing permissions and
	 limitations under the License.*/
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
  pageSize?: number;
};

export const InternalDqlQuery = ({
  title,
  queryNamespace,
  queryName,
  EmptyState = DqlEmptyState,
  pageSize,
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

  return <TabularDataTable title={title} data={value} pageSize={pageSize} />;
};
