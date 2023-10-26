import { Table, TableColumn } from '@backstage/core-components';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';
import { Link } from '@material-ui/core';
import _ from 'lodash';
import React, { ReactNode } from 'react';

type TabularDataTableProps = {
  title: string;
  data: TabularData;
};

function cellRenderer(field: string) {
  return (data: any): ReactNode => {
    const cellData = data[field];
    if (cellData === undefined) {
      return null;
    }

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
}

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
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
    />
  );
};
