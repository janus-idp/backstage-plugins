import * as React from 'react';
import { CSSProperties } from 'react';

import { TableRow } from '@material-ui/core';

import { Health } from '../../types/Health';
import { StatefulFiltersProps } from '../Filters/StatefulFilters';
import { IstioTypes, RenderResource, Resource } from './Config';
import { actionRenderer } from './Renderers';

type VirtualItemProps = {
  action?: JSX.Element;
  className?: string;
  columns: any[];
  config: Resource;
  index: number;
  item: RenderResource;
  key: string;
  statefulFilterProps?: StatefulFiltersProps;
  style?: CSSProperties;
};

export const VirtualItem = (props: VirtualItemProps) => {
  const getBadge = (): React.ReactNode => {
    // @ts-ignore
    return itemProps.config.name !== 'istio'
      ? itemProps.config.badge
      : IstioTypes[itemProps.item.type].badge;
  };

  const renderDetails = (
    item: RenderResource,
    health?: Health,
  ): React.ReactNode => {
    return props.columns
      .filter(object => !!object.renderer)
      .map(object =>
        object.renderer(
          item,
          props.config,
          getBadge(),
          health,
          props.statefulFilterProps,
        ),
      );
  };

  const { style, className, item } = props;
  const cluster = item.cluster ? `_Cluster${item.cluster}` : '';
  const namespace = 'namespace' in item ? `_Ns${item.namespace}` : '';
  const type = 'type' in item ? `_${item.type}` : '';
  // End result looks like: VirtualItem_Clusterwest_Nsbookinfo_gateway_bookinfo-gateway

  const key = `VirtualItem${cluster}${namespace}${type}_${item.name}`;

  return (
    <TableRow
      style={style}
      className={className}
      role="row"
      key={key}
      data-test={key}
    >
      {renderDetails(item)}
      {props.action && actionRenderer(key, props.action)}
    </TableRow>
  );
};
