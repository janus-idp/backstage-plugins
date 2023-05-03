import * as React from 'react';
import { Breadcrumbs, Link, Progress, Table } from '@backstage/core-components';
import { columns } from './tableHeading';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { imageTagRouteRef } from '../../routes';
import { useRouteRef } from '@backstage/core-plugin-api';
import { useStyles } from '../../utils';
import { useAllImageStreamTags } from '../../hooks/useAllImageStreamTags';

export const OcirTagsTable = () => {
  const classes = useStyles();
  const { ns = '', image = '' } = useParams();
  const { loading: loadingTags, imageStreamTagsData } = useAllImageStreamTags(
    ns,
    image,
  );
  const routeLink = useRouteRef(imageTagRouteRef);

  const breadCrumbs = (
    <Breadcrumbs aria-label="breadcrumb">
      <Link
        underline="hover"
        color="inherit"
        component={RouterLink}
        to="/openshift-image-registry"
      >
        Images
      </Link>
      <Link
        color="primary"
        underline="hover"
        component={RouterLink}
        to={routeLink({ ns, image })}
      >
        {image}
      </Link>
    </Breadcrumbs>
  );

  if (loadingTags) {
    return <Progress />;
  }

  return (
    <div>
      {breadCrumbs}
      <div style={{ border: '1px solid #ddd' }}>
        <Table
          title={image}
          options={{ paging: true, padding: 'dense' }}
          data={imageStreamTagsData}
          columns={columns}
          emptyContent={
            <div className={classes.empty}>No tags found for this image</div>
          }
        />
      </div>
    </div>
  );
};
