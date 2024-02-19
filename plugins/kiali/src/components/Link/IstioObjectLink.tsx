import React from 'react';
import { Link } from 'react-router-dom';

import { isMultiCluster, Paths } from '../../config';
import { IstioTypes } from '../VirtualList/Config';

type ReferenceIstioObjectProps = {
  cluster?: string;
  name: string;
  namespace: string;
  query?: string;
  subType?: string;
  type: string;
};

type IstioObjectProps = ReferenceIstioObjectProps & {
  children: React.ReactNode;
};

export const getIstioObjectUrl = (
  name: string,
  namespace: string,
  type: string,
  cluster?: string,
  query?: string,
): string => {
  const istioType = IstioTypes[type];
  let to = `/namespaces/${namespace}/${Paths.ISTIO}`;

  to = `${to}/${istioType.url}/${name}`;

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

export const IstioObjectLink: React.FC<IstioObjectProps> = (
  props: IstioObjectProps,
) => {
  const { name, namespace, type, cluster, query } = props;
  const href = getIstioObjectUrl(name, namespace, type, cluster, query);

  return (
    <Link to={href} data-test={`${type}-${namespace}-${name}`}>
      {props.children}
    </Link>
  );
};
