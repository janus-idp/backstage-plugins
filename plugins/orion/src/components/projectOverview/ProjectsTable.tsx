import React from 'react';
import { ProjectStatusType, ProjectType } from './types';
import { Table, TableColumn } from '@backstage/core-components';

const HumanReadableProjectStatus: {
  [key in ProjectStatusType]: string;
} = {
  'in-progress': 'In Progress',
  'on-boarded': 'On Boarded',
  'all-projects': '', // Should not appear in the table
};

export const ProjectsTable: React.FC<{ projects: ProjectType[] }> = ({
  projects,
}) => {
  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    { title: 'User', field: 'username' },
    { title: 'Status', field: 'status' },
    { title: 'Description', field: 'description' },
    { title: 'Created', field: 'createdDate' },
    { title: 'Modified', field: 'modifyDate' },
  ];

  const data = projects.map(project => {
    return {
      ...project,
      status: HumanReadableProjectStatus[project.status || ''] || '',
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
