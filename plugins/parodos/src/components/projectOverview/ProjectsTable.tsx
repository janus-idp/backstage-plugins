import React from 'react';
import { Table, TableColumn } from '@backstage/core-components';
import {
  getHumanReadableDate,
  HumanReadableProjectStatus,
} from '../converters';
import { Project } from '../../models/project';

export const ProjectsTable: React.FC<{ projects: Project[] }> = ({
  projects,
}) => {
  // TODO: additional fields tracked here: https://issues.redhat.com/browse/FLPATH-131
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
        : 'In Progress',
    };
  });

  return (
    <Table
      title="Projects"
      options={{ search: false, paging: true }}
      columns={columns}
      data={data}
    />
  );
};
