import * as React from 'react';
import { Link, TableColumn } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { Box, Chip } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { imageTagRouteRef } from '../../routes';

export const columns: TableColumn[] = [
  {
    title: 'Name',
    field: 'name',
    type: 'string',
    highlight: true,
    render: (row: any) => {
      const ImageLink = () => {
        const routeLink = useRouteRef(imageTagRouteRef);
        return (
          <Link
            component={RouterLink}
            to={routeLink({ ns: row.namespace, image: row.name })}
          >
            {row.name}
          </Link>
        );
      };

      return <ImageLink />;
    },
  },
  {
    title: 'Tags',
    field: 'tags',
    type: 'string',
    render: (row: any) => {
      const Tags = () => {
        const tags = row.tags;
        return (
          <Box>
            {tags.map((tag: string, index: number) => (
              <Chip key={index} label={tag} variant="outlined" />
            ))}
          </Box>
        );
      };

      return <Tags />;
    },
  },
  {
    title: 'Last Modified',
    field: 'last_modified',
    type: 'date',
  },
];
