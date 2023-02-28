import * as React from 'react';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { Node } from '@patternfly/react-topology';
import Decorator from './Decorator';
import { getTopologyResourceObject } from '../../../utils/topology-utils';
import { useIngressURL } from '../../../hooks/useIngressURL';

interface DefaultDecoratorProps {
  element: Node;
  radius: number;
  x: number;
  y: number;
}

export const UrlDecorator: React.FC<DefaultDecoratorProps> = ({
  element,
  radius,
  x,
  y,
}) => {
  const resourceObj = getTopologyResourceObject(element.getData());
  const url = useIngressURL(resourceObj);
  if (!url) {
    return null;
  }
  const label = 'Open URL';
  return (
    <Tooltip key="route" content={label} position={TooltipPosition.right}>
      <Decorator
        x={x}
        y={y}
        radius={radius}
        href={url}
        external
        ariaLabel={label}
      >
        <g transform={`translate(-${radius / 2}, -${radius / 2})`}>
          <ExternalLinkAltIcon style={{ fontSize: radius }} title={label} />
        </g>
      </Decorator>
    </Tooltip>
  );
};

export const getUrlDecorator = (
  element: Node,
  radius: number,
  x: number,
  y: number,
) => <UrlDecorator key="url" element={element} radius={radius} x={x} y={y} />;
