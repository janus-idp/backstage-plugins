import * as React from 'react';

import {
  Node,
  TopologyQuadrant,
} from '@patternfly/react-topology/dist/esm/types';

import { TopologyDecorator } from '../../../types/topology-types';

const getDecoratorForQuadrant = (
  location: TopologyQuadrant,
  element: Node,
  decorator: TopologyDecorator,
  centerX: number,
  centerY: number,
  nodeRadius: number,
  decoratorRadius: number,
): React.ReactElement | null => {
  let x: number;
  let y: number;
  const deltaX = nodeRadius > 0 ? nodeRadius : 0;
  const deltaY = nodeRadius > 0 ? nodeRadius : 0;
  const offset = nodeRadius > 0 ? decoratorRadius * 0.7 : 0;
  switch (location) {
    case TopologyQuadrant.upperRight:
      x = centerX + deltaX - offset;
      y = centerY - deltaY + offset;
      break;
    case TopologyQuadrant.lowerRight:
      x = centerX + deltaX - offset;
      y = centerY + deltaY - offset;
      break;
    case TopologyQuadrant.upperLeft:
      x = centerX - deltaX + offset;
      y = centerY - deltaY + offset;
      break;
    case TopologyQuadrant.lowerLeft:
      x = centerX - deltaX + offset;
      y = centerY + deltaY - offset;
      break;
    default:
      x = centerX;
      y = centerY;
  }

  let retDecorator = null;

  retDecorator = decorator.decorator(element, decoratorRadius, x, y);
  return retDecorator;
};

export const getNodeDecorators = (
  element: Node,
  decorators: TopologyDecorator[],
  centerX: number,
  centerY: number,
  nodeRadius: number, // -1 to use width/height
  decoratorRadius: number,
): React.ReactNode => {
  return (
    <>
      {decorators.map(decorator =>
        getDecoratorForQuadrant(
          decorator.quadrant,
          element,
          decorator,
          centerX,
          centerY,
          nodeRadius,
          decoratorRadius,
        ),
      )}
    </>
  );
};
