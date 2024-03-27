import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Link } from '@material-ui/core';

import { isMultiCluster, Paths } from '../../config';
import { pluginRoot } from '../BreadcrumbView/BreadcrumbView';
import { PFBadge, PFBadges } from '../Pf/PfBadges';

type WorkloadLinkProps = {
  cluster?: string;
  name: string;
  namespace: string;
  query?: string;
};

export const getWorkloadURL = (
  name: string,
  namespace: string,
  cluster?: string,
  query?: string,
): string => {
  let to = `/${pluginRoot}/${Paths.WORKLOADS}/${namespace}`;

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

const WorkloadLinkItem = (props: WorkloadLinkProps) => {
  const { name, namespace, cluster, query } = props;
  const href = getWorkloadURL(name, namespace, cluster, query);

  return (
    <Link
      component={RouterLink}
      to={href}
      data-test={`workload-${namespace}-${name}`}
    >
      {`${namespace}/${name}`}
    </Link>
  );
};

export const WorkloadLink = (props: WorkloadLinkProps) => {
  const { name, namespace, cluster, query } = props;

  return (
    <>
      <PFBadge badge={PFBadges.Workload} />
      <WorkloadLinkItem
        name={name}
        namespace={namespace}
        cluster={cluster}
        query={query}
      />
    </>
  );
};
