import { Table, TableColumn } from '@backstage/core-components';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';
import _ from 'lodash';
import React from 'react';

type TabularDataTableProps = {
  title: string;
  data: TabularData;
};

export const TabularDataTable = ({ title, data }: TabularDataTableProps) => {
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
