import * as React from 'react';
import { CSSProperties } from 'react';

import { TableRow } from '@material-ui/core';

import { hasHealth, Health } from '../../types/Health';
import { StatefulFiltersProps } from '../Filters/StatefulFilters';
import { PFBadgeType } from '../Pf/PfBadges';
import { IstioTypes, RenderResource, Resource } from './Config';
import { actionRenderer } from './Renderers';

type VirtualItemProps = {
  action?: JSX.Element;
  className?: string;
  columns: any[];
  config: Resource;
  index: number;
  item: RenderResource & { type?: string }; // Add 'type' property to 'RenderResource' type
  key: string;
  statefulFilterProps?: StatefulFiltersProps;
  style?: CSSProperties;
  view?: string;
};

export const VirtualItem = (props: VirtualItemProps) => {
  const [itemState, setItemState] = React.useState<Health>();

  React.useEffect(() => {
    if (hasHealth(props.item)) {
      if ('health' in props.item) {
        setItemState(props.item.health);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemState]);

  const getBadge = (): React.ReactNode | PFBadgeType => {
    if (props.config.name !== 'istio') {
      return props.config.badge;
    } else if (props.item.type) {
      return IstioTypes[props.item.type].badge;
    }
    return <></>;
  };

  const renderDetails = (
    item: RenderResource & { type?: string }, // Add 'type' property to 'RenderResource' type
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
          props.view,
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
      {renderDetails(item, itemState)}
      {props.action && actionRenderer(key, props.action)}
    </TableRow>
  );
};
