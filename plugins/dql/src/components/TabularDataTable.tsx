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
import { Table, TableColumn } from '@backstage/core-components';
import {
  TabularData,
  TabularDataRow,
} from '@dynatrace/backstage-plugin-dql-common';
import { Link } from '@material-ui/core';
import _ from 'lodash';
import React, { ReactNode } from 'react';

type TabularDataTableProps = {
  title: string;
  data: TabularData;
  pageSize?: number;
};

const cellRenderer = (field: string) => {
  return (data: TabularDataRow): ReactNode => {
    const cellData = data[field];

    if (typeof cellData === 'string') {
      return cellData;
    }

    if (cellData.type === 'link') {
      return (
        <Link href={cellData.url} target="_blank" rel="noopener">
          {cellData.text}
        </Link>
      );
    }

    return JSON.stringify(cellData);
  };
};

export const TabularDataTable = ({
  title,
  data,
  pageSize = 10,
}: TabularDataTableProps) => {
  let columns: TableColumn[] = [];

  if (data.length !== 0) {
    const firstRow = data[0];
    columns = _.keys(firstRow).map(key => {
      return { title: key, field: key, render: cellRenderer(key) };
    });
  }

  return (
    <Table
      title={title}
      options={{ search: true, paging: true, pageSize: pageSize }}
      columns={columns}
      data={data}
    />
  );
};
