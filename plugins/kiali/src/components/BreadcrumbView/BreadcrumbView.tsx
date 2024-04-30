import * as React from 'react';
import { Location, useLocation } from 'react-router-dom';

import { Breadcrumbs } from '@material-ui/core';

import { HistoryManager } from '../../app/History';
import { isMultiCluster, Paths } from '../../config';
import { kialiStyle, useLinkStyle } from '../../styles/StyleUtils';
import { dicIstioType } from '../../types/IstioConfigList';
import { JanusObjectLink } from '../../utils/janusLinks';
import { FilterSelected } from '../Filters/StatefulFilters';

const ItemNames = {
  applications: 'App',
  services: 'Service',
  workloads: 'Workload',
  istio: 'Istio Object',
};

const IstioName = 'Istio Config';
const namespaceRegex =
  /kiali\/([a-z0-9-]+)\/([\w-.]+)\/([\w-.*]+)(\/([\w-.]+))?(\/([\w-.]+))?/;

export const getPath = (props: Location) => {
  const match = namespaceRegex.exec(props.pathname) || [];
  const ns = match[2];
  // @ts-ignore
  const page = Paths[match[1]?.toUpperCase()];
  const istioType = match[3];
  const urlParams = new URLSearchParams(props.search);
  const itemName = page !== 'istio' ? match[3] : match[5];
  return {
    cluster: HistoryManager.getClusterName(urlParams),
    istioType: istioType,
    item: itemName,
    // @ts-ignore
    itemName: ItemNames[page],
    namespace: ns,
    pathItem: page,
  };
};

const breadcrumStyle = kialiStyle({
  marginBottom: '20px',
  marginTop: '-20px',
});

export const BreadcrumbView = (props: { entity?: boolean }) => {
  const capitalize = (str: string) => {
    return str?.charAt(0)?.toUpperCase() + str?.slice(1);
  };

  const path = getPath(useLocation());

  const istioTypeF = (rawType: string) => {
    const istioType = Object.keys(dicIstioType).find(
      // @ts-ignore
      key => dicIstioType[key] === rawType,
    );
    return istioType || capitalize(rawType);
  };

  const cleanFilters = () => {
    FilterSelected.resetFilters();
  };

  const isIstioF = () => {
    return path?.pathItem === 'istio';
  };

  const namespace = path ? path.namespace : '';
  const item = path ? path.item : '';
  const istioType = path ? path.istioType : '';
  const pathItem = path ? path.pathItem : '';
  const linkStyle = useLinkStyle();

  const isIstio = isIstioF();

  const tab = `tabresources=${pathItem}`;
  const filterNs = `namespaces=${namespace}`;

  return (
    <div className={breadcrumStyle}>
      <Breadcrumbs>
        <JanusObjectLink
          entity={props.entity}
          query={tab}
          onClick={cleanFilters}
          className={linkStyle}
          type={pathItem}
        >
          {isIstio ? IstioName : capitalize(pathItem)}
        </JanusObjectLink>
        <JanusObjectLink
          entity={props.entity}
          query={props.entity ? `${tab}&${filterNs}` : filterNs}
          onClick={cleanFilters}
          className={linkStyle}
          type={pathItem}
        >
          Namespace: {namespace}
        </JanusObjectLink>
        {isIstio ? (
          <>
            <JanusObjectLink
              entity={props.entity}
              query={`${filterNs}&type=${
                // @ts-ignore
                dicIstioType[path?.istioType || '']
              }`}
              onClick={cleanFilters}
              className={linkStyle}
              type={pathItem}
            >
              {istioType ? istioTypeF(istioType) : istioType}
            </JanusObjectLink>
            {' / '}
            {item}
          </>
        ) : (
          <JanusObjectLink
            entity={props.entity}
            query={
              path?.cluster && isMultiCluster
                ? `clusterName=${path.cluster}`
                : ''
            }
            namespace={path?.namespace}
            name={path?.item}
            onClick={cleanFilters}
            type={path?.pathItem}
          >
            {item}
          </JanusObjectLink>
        )}
      </Breadcrumbs>
    </div>
  );
};
