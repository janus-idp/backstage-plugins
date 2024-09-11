import React from 'react';

import { Link, TableColumn } from '@backstage/core-components';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useFormikContext } from 'formik';

import { AddRepositoriesFormValues, AddRepositoryData } from '../../types';
import {
  calculateLastUpdated,
  descendingComparator,
  getImportStatus,
  urlHelper,
} from '../../utils/repository-utils';
import CatalogInfoAction from './CatalogInfoAction';
import DeleteRepository from './DeleteRepository';
import SyncRepository from './SyncRepository';

const ImportStatus = ({ data }: { data: AddRepositoryData }) => {
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  return getImportStatus(
    values.repositories[data.id]?.catalogInfoYaml?.status as string,
    true,
  );
};

const LastUpdated = ({ data }: { data: AddRepositoryData }) => {
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  return calculateLastUpdated(
    values.repositories[data.id]?.catalogInfoYaml?.lastUpdated || '',
  );
};

export const columns: TableColumn<AddRepositoryData>[] = [
  {
    title: 'Name',
    field: 'repoName',
    type: 'string',
  },
  {
    title: 'Repo URL',
    field: 'repoUrl',
    type: 'string',
    align: 'left',
    render: (props: AddRepositoryData) => {
      return (
        <Link to={props.repoUrl || ''}>
          {urlHelper(props.repoUrl || '')}
          <OpenInNewIcon style={{ verticalAlign: 'sub', paddingTop: '7px' }} />
        </Link>
      );
    },
  },
  {
    title: 'Organization',
    field: 'organizationUrl',
    type: 'string',
    align: 'left',
    render: (props: AddRepositoryData) => {
      return (
        <Link to={props.organizationUrl || ''}>
          {urlHelper(props.organizationUrl || '')}
          <OpenInNewIcon style={{ verticalAlign: 'sub', paddingTop: '7px' }} />
        </Link>
      );
    },
  },
  {
    title: 'Status',
    field: 'catalogInfoYaml.status',
    type: 'string',
    align: 'left',
    customSort: (a: AddRepositoryData, b: AddRepositoryData) =>
      descendingComparator(a, b, 'catalogInfoYaml.status'),
    render: (data: AddRepositoryData) => <ImportStatus data={data} />,
  },
  {
    title: 'Last updated',
    field: 'catalogInfoYaml.lastUpdated',
    type: 'datetime',
    align: 'left',
    render: (data: AddRepositoryData) => <LastUpdated data={data} />,
  },
  {
    title: 'Actions',
    field: 'actions',
    sorting: false,
    type: 'string',
    align: 'left',
    render: (data: AddRepositoryData) => (
      <>
        <CatalogInfoAction data={data} />
        <DeleteRepository data={data} />
        <SyncRepository data={data} />
      </>
    ),
  },
];
