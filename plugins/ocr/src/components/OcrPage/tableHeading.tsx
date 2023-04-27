import React from 'react';
import { TableColumn, Link } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { imageRouteRef } from '../../routes';
import { Link as RouterLink } from 'react-router-dom';

export const columns: TableColumn[] = [
  {
    title: 'Name',
    field: 'name',
    type: 'string',
    highlight: true,
    render: (row: any) => {
      const LinkWrapper = () => {
        const routeLink = useRouteRef(imageRouteRef);
        return (
          <Link component={RouterLink} to={routeLink({ cluster: "mock-cluster", image: row.name })}>
            {row.name}
          </Link>
        );
      };

      return <LinkWrapper />;
    },
  },
  {
    title: 'Tags',
    field: 'tags',
    type: 'string',
  },
  {
    title: 'Last Modified',
    field: 'last_modified',
    type: 'date',
  },
];

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));
