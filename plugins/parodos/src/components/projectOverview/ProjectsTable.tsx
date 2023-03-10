import React from 'react';
import { ProjectType } from '../types';
import { Table, TableColumn } from '@backstage/core-components';
import {
  getHumanReadableDate,
  HumanReadableProjectStatus,
} from '../converters';

export const ProjectsTable: React.FC<{ projects: ProjectType[] }> = ({
  projects,
}) => {
  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    { title: 'User', field: 'username' },
    { title: 'Status', field: 'status' },
    { title: 'Description', field: 'description' },
    { title: 'Created', field: 'createDate' },
    { title: 'Modified', field: 'modifyDate' },
  ];

  const data = projects.map(project => {
    return {
      ...project,
      createDate: getHumanReadableDate(project.createDate),
      modifyDate: getHumanReadableDate(project.modifyDate),
      status: project.status
        ? HumanReadableProjectStatus[project.status]
        : undefined,
    };
  });

  return (
    <Table
      title="Projects"
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
    />
  );
};
