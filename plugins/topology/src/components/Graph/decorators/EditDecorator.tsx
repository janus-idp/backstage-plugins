import * as React from 'react';

import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { Node } from '@patternfly/react-topology';

import {
  getCheDecoratorData,
  getEditURL,
} from '../../../utils/edit-decorator-utils';
import RouteDecoratorIcon from '../../DecoratorIcons/RouteDecoratorIcon';
import Decorator from './Decorator';

interface DefaultDecoratorProps {
  element: Node;
  radius: number;
  x: number;
  y: number;
}

const EditDecorator: React.FC<DefaultDecoratorProps> = ({
  element,
  radius,
  x,
  y,
}) => {
  const workloadData = element.getData().data;
  const { editURL, vcsURI, vcsRef, cheCluster } = workloadData;
  const cheURL = getCheDecoratorData(cheCluster);
  const cheEnabled = !!cheURL;
  const editUrl = editURL || getEditURL(vcsURI, vcsRef, cheURL);
  const repoIcon = (
    <RouteDecoratorIcon
      routeURL={editUrl}
      radius={radius}
      cheEnabled={cheEnabled}
    />
  );

  if (!repoIcon) {
    return null;
  }
  const label = 'Edit source code';
  return (
    <Tooltip content={label} position={TooltipPosition.right}>
      <Decorator
        x={x}
        y={y}
        radius={radius}
        href={editUrl}
        external
        ariaLabel={label}
      >
        <g transform={`translate(-${radius / 2}, -${radius / 2})`}>
          {repoIcon}
        </g>
      </Decorator>
    </Tooltip>
  );
};

export default EditDecorator;
