import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Link, Tooltip } from '@material-ui/core';

import { isMultiCluster, KialiIcon, Paths } from '../../config';
import { kialiStyle } from '../../styles/StyleUtils';
import { PFBadge } from '../Pf/PfBadges';
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
  let to = `${Paths.ISTIO}/${namespace}`;

  to = `${to}/${istioType.url}/${name}`;

  if (cluster && isMultiCluster) {
    to = `${to}?clusterName=${cluster}`;
  }

  if (!query) {
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
    <Link
      component={RouterLink}
      to={href}
      data-test={`${type}-${namespace}-${name}`}
    >
      {props.children}
    </Link>
  );
};

export const ReferenceIstioObjectLink = (props: ReferenceIstioObjectProps) => {
  const { name, namespace, cluster, type, subType } = props;
  const istioType = IstioTypes[type];

  let showLink = true;
  let showTooltip = false;
  let tooltipMsg: string | undefined = undefined;
  let reference = `${namespace}/${name}`;

  const infoStyle = kialiStyle({
    marginLeft: '0.5rem',
    verticalAlign: '-0.06em !important',
  });

  if (name === 'mesh') {
    reference = name;
    showLink = false;
    showTooltip = true;
    tooltipMsg =
      'The reserved word, "mesh", implies all of the sidecars in the mesh';
  }

  return (
    <>
      <PFBadge badge={istioType.badge} />

      {showLink && (
        <IstioObjectLink
          name={name}
          namespace={namespace}
          cluster={cluster}
          type={type}
          subType={subType}
        >
          {reference}
        </IstioObjectLink>
      )}

      {!showLink && <div style={{ display: 'inline-block' }}>{reference}</div>}

      {showTooltip && (
        <Tooltip title={<div style={{ textAlign: 'left' }}>{tooltipMsg}</div>}>
          <KialiIcon.Info className={infoStyle} />
        </Tooltip>
      )}
    </>
  );
};
