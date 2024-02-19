import * as React from 'react';
import { Link } from 'react-router-dom';

import { Breadcrumbs } from '@material-ui/core';

import { HistoryManager } from '../../app/History';
import { isMultiCluster, Paths } from '../../config';
import { kialiStyle, linkStyle } from '../../styles/StyleUtils';
import { dicIstioType } from '../../types/IstioConfigList';
import { FilterSelected } from '../Filters/StatefulFilters';

interface BreadCumbViewProps {
  location: {
    pathname: string;
    search: string;
  };
}

const ItemNames = {
  applications: 'App',
  services: 'Service',
  workloads: 'Workload',
  istio: 'Istio Object',
};

const pluginRoot = 'kiali';
const IstioName = 'Istio Config';
const namespaceRegex =
  /kiali\/([a-z0-9-]+)\/([\w-.]+)\/([\w-.*]+)(\/([\w-.]+))?(\/([\w-.]+))?/;

export const getPath = (props: BreadCumbViewProps) => {
  const match = props.location.pathname.match(namespaceRegex) || [];
  const ns = match[2];
  // @ts-ignore
  const page = Paths[match[1].toUpperCase()];
  const istioType = match[3];
  const urlParams = new URLSearchParams(props.location.search);
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
  marginTop: '-30px',
});

export const BreadcrumbView = (props: BreadCumbViewProps) => {
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const path = getPath(props);

  const istioTypeF = (rawType: string) => {
    // @ts-ignore
    const istioType = Object.keys(dicIstioType).find(
      key => dicIstioType[key] === rawType,
    );
    return istioType ? istioType : capitalize(rawType);
  };

  const cleanFilters = () => {
    FilterSelected.resetFilters();
  };

  const isIstioF = () => {
    return path?.pathItem === 'istio';
  };

  const getItemPage = () => {
    if (path) {
      let pathT = `/${pluginRoot}/${path?.pathItem}/${path?.namespace}/${path?.item}`;
      if (path?.cluster && isMultiCluster) {
        pathT += `?clusterName=${path.cluster}`;
      }
      return pathT;
    }
    return '';
  };

  const namespace = path ? path.namespace : '';
  const item = path ? path.item : '';
  const istioType = path ? path.istioType : '';
  const pathItem = path ? path.pathItem : '';

  const isIstio = isIstioF();
  const linkItem = isIstio ? (
    { item }
  ) : (
    <Link to={getItemPage()} onClick={cleanFilters}>
      {item}
    </Link>
  );
  // @ts-ignore
  const linkTo = `/${pluginRoot}/${pathItem}?namespaces=${namespace}&type=${
    dicIstioType[path?.istioType || '']
  }`;
  return (
    <div className={breadcrumStyle}>
      <Breadcrumbs>
        <Link
          to={`/${pluginRoot}/${pathItem}`}
          onClick={cleanFilters}
          className={linkStyle}
        >
          {isIstio ? IstioName : capitalize(pathItem)}
        </Link>
        <Link
          to={`/${pluginRoot}/${pathItem}?namespaces=${namespace}`}
          onClick={cleanFilters}
          className={linkStyle}
        >
          Namespace: {namespace}
        </Link>
        {isIstio && (
          <Link to={linkTo} onClick={cleanFilters} className={linkStyle}>
            {istioType ? istioTypeF(istioType) : istioType}
          </Link>
        )}
        {linkItem}
      </Breadcrumbs>
    </div>
  );
};
