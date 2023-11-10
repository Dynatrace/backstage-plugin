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

export const TabularDataTable = ({ title, data }: TabularDataTableProps) => {
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
      options={{ search: false, paging: true, pageSize: 20 }}
      columns={columns}
      data={data}
    />
  );
};
