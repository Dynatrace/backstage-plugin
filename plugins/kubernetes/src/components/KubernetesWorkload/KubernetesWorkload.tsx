import {
  Progress,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { makeStyles } from '@material-ui/core';
import React from 'react';
import { useKubernetesWorkloadData } from '../../hooks/useKubernetesWorkloadData';
import { User } from '../../types';

type DenseTableProps = {
  users: User[];
};

const useStyles = makeStyles({
  avatar: {
    height: 32,
    width: 32,
    borderRadius: '50%',
  },
});

export const DenseTable = ({ users }: DenseTableProps) => {
  const classes = useStyles();

  const columns: TableColumn[] = [
    { title: 'Avatar', field: 'avatar' },
    { title: 'Name', field: 'name' },
    { title: 'Email', field: 'email' },
    { title: 'Nationality', field: 'nationality' },
  ];

  const data = users.map(user => {
    return {
      avatar: (
        <img
          src={user.picture}
          className={classes.avatar}
          alt={user.name.first}
        />
      ),
      name: `${user.name.first} ${user.name.last}`,
      email: user.email,
      nationality: user.nat,
    };
  });

  return (
    <Table
      title="Example User List"
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
    />
  );
};

export const KubernetesWorkload = () => {
  const { entity } = useEntity();
  const { error, loading, value } = useKubernetesWorkloadData();

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <>
      <div>Hello {entity.metadata.name}</div>
      <div>Status: {value?.status}</div>
      <DenseTable users={value?.data || []} />
    </>
  );
};
