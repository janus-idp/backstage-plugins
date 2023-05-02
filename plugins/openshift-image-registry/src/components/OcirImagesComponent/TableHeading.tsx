import * as React from 'react';
import { TableColumn } from '@backstage/core-components';
// import { useRouteRef } from '@backstage/core-plugin-api';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Box, Chip } from '@material-ui/core';
// import { imageRouteRef } from '../../routes';
// import { Link as RouterLink } from 'react-router-dom';

export const columns: TableColumn[] = [
  {
    title: 'Name',
    field: 'name',
    type: 'string',
    highlight: true,
    render: (row: any) => {
      const LinkWrapper = () => {
        // const routeLink = useRouteRef(imageRouteRef);
        return (
          //   <Link component={RouterLink} to={routeLink({ cluster: "mock-cluster", image: row.name })}>
          <>{row.name}</>
          //   </Link>
        );
      };

      return <LinkWrapper />;
    },
  },
  {
    title: 'Tags',
    field: 'tags',
    type: 'string',
    render: (row: any) => {
      const TagsWrapper = () => {
        const tags = row.tags;

        return (
          <Box>
            {tags.map((tag: string) => (
              <Chip label={tag} variant="outlined" />
            ))}
          </Box>
        );
      };

      return <TagsWrapper />;
    },
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
