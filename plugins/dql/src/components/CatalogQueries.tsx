/**
 * @license
 * Copyright 2024 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { InternalCatalogQueries } from './InternalCatalogQueries';
import { EmptyStateProps } from './types';
import { EmptyState } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { ExtendedEntity } from '@dynatrace/backstage-plugin-dql-common';
import React from 'react';

export type CatalogInfoQueryProps = {
  emptyState?: React.ComponentType<EmptyStateProps>;
  pageSize?: number;
};

/**
 * CatalogInfoQuery is a wrapper around the InternalCatalogQueries from the entity, that provides error handling
 * for invalid props.
 * @param props DqlQueryProps
 * @returns React.ReactElement either a InternalCatalogQueries or an ErrorPanel
 */
export const CatalogInfoQuery = (props: CatalogInfoQueryProps) => {
  const { entity } = useEntity();
  const extendedEntity: ExtendedEntity = entity;
  const queries = extendedEntity.metadata.dynatrace?.queries ?? [];
  return (
    <>
      {queries.length > 0 ? (
        <InternalCatalogQueries
          queryNamespace={'catalog'}
          EmptyState={props.emptyState}
          pageSize={props.pageSize}
        ></InternalCatalogQueries>
      ) : (
        <EmptyState
          title="No queries defined in catalog-info.yaml for this entity."
          missing="info"
          description="You need to add queries for this entity in the catalog-info.yaml file."
        ></EmptyState>
      )}
    </>
  );
};
