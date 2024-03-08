import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Link } from '@material-ui/core';

import { PFBadge, PFBadges } from '../../components/Pf/PfBadges';
import { isMultiCluster, Paths } from '../../config';
import { pluginRoot } from '../BreadcrumbView/BreadcrumbView';

type ServiceLinkProps = {
  cluster?: string;
  name: string;
  namespace: string;
  query?: string;
};

export const getServiceURL = (
  name: string,
  namespace: string,
  cluster?: string,
  query?: string,
): string => {
  let to = `/${pluginRoot}/${Paths.SERVICES}/${namespace}`;

  to = `${to}/${name}`;

  if (cluster && isMultiCluster) {
    to = `${to}?clusterName=${cluster}`;
  }

  if (!!query) {
    if (to.includes('?')) {
      to = `${to}&${query}`;
    } else {
      to = `${to}?${query}`;
    }
  }

  return to;
};

const ServiceLinkItem = (props: ServiceLinkProps) => {
  const { name, namespace, cluster, query } = props;
  const href = getServiceURL(name, namespace, cluster, query);

  return (
    <Link
      component={RouterLink}
      to={href}
      data-test={`service-${namespace}-${name}`}
    >
      {`${namespace}/${name}`}
    </Link>
  );
};

export const ServiceLink = (props: ServiceLinkProps) => {
  const { name, namespace, cluster, query } = props;

  return (
    <>
      <PFBadge badge={PFBadges.Service} />
      <ServiceLinkItem
        name={name}
        namespace={namespace}
        cluster={cluster}
        query={query}
      />
    </>
  );
};
