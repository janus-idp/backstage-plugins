import * as React from 'react';

import { Link } from '@backstage/core-components';
import {
  RouteFunc,
  SubRouteRef,
  useRouteRef,
} from '@backstage/core-plugin-api';

import { isMultiCluster } from '../config';
import {
  appDetailRouteRef,
  appsRouteRef,
  istioConfigDetailRouteRef,
  istioConfigRouteRef,
  rootRouteRef,
  servicesDetailRouteRef,
  servicesRouteRef,
  workloadsDetailRouteRef,
  workloadsRouteRef,
} from '../routes';

type routeRefParams = undefined | { [key: string]: string };
export const janusRoutesObject: {
  [key: string]: { id: string; ref: SubRouteRef };
} = {
  workloads: { id: 'workload', ref: workloadsDetailRouteRef },
  services: { id: 'service', ref: servicesDetailRouteRef },
  applications: { id: 'app', ref: appDetailRouteRef },
  istio: { id: 'object', ref: istioConfigDetailRouteRef },
};

export const janusRoutesSection: { [key: string]: SubRouteRef } = {
  istio: istioConfigRouteRef,
  workloads: workloadsRouteRef,
  services: servicesRouteRef,
  applications: appsRouteRef,
};

const addQuery = (endpoint: string, cluster?: string, query?: string) => {
  let queryParam = query;
  if (cluster && isMultiCluster) {
    queryParam += queryParam ? '&' : '';
    queryParam += `clusterName=${cluster}`;
  }
  return queryParam ? `${endpoint}?${queryParam}` : endpoint;
};

interface JanusLinkProps {
  cluster?: string;
  key?: string;
  className?: string;
  entity?: boolean;
  root?: boolean;
  name?: string;
  type: string;
  namespace?: string;
  objectType?: string;
  query?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export const JanusObjectLink = (props: JanusLinkProps) => {
  const { name, type, objectType, namespace, query, cluster } = props;
  const link: RouteFunc<routeRefParams> = useRouteRef(
    props.entity
      ? props.root
        ? rootRouteRef
        : janusRoutesObject[type].ref
      : props.root
      ? janusRoutesSection[type]
      : janusRoutesObject[type].ref,
  );
  var to = '';
  if (!props.root) {
    const items: { [key: string]: string } = { namespace: namespace || '' };

    if (type && name) {
      items[janusRoutesObject[type].id] = name;
    }
    if (objectType) {
      items.objectType = objectType;
    }
    to = link(items);
  } else {
    to = link();
  }
  const href = addQuery(to, cluster, query);
  return (
    <Link
      to={href}
      data-test={`${
        type ? janusRoutesObject[type].id : ''
      }-${namespace}-${name}`}
      {...props}
    >
      {props.children || `${namespace}/${name}`}
    </Link>
  );
};
