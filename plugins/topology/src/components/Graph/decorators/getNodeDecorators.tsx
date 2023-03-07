import * as React from 'react';
import {
  Node,
  TopologyQuadrant,
} from '@patternfly/react-topology/dist/esm/types';
import { TopologyDecorator } from '../../../types/topology-types';
import { getDefaultShapeDecoratorCenter } from '@patternfly/react-topology';

const getExtensionDecoratorForQuadrant = (
  location: string,
  element: Node,
  decorators: { [key: string]: TopologyDecorator[] },
  decoratorRadius: number,
): React.ReactElement => {
  const quadrant: TopologyQuadrant =
    TopologyQuadrant[location as keyof typeof TopologyQuadrant];
  let { x, y } = getDefaultShapeDecoratorCenter(quadrant, element);
  const offset = decoratorRadius * 0.4;
  const top =
    quadrant === TopologyQuadrant.upperRight ||
    quadrant === TopologyQuadrant.upperLeft;
  const left =
    quadrant === TopologyQuadrant.upperLeft ||
    quadrant === TopologyQuadrant.lowerLeft;
  x += left ? -1 * offset : offset;
  y += top ? -1 * offset : offset;

  let retDecorator;
  let i = 0;
  const length = decorators?.[location]?.length ?? 0;
  while (!retDecorator && i < length) {
    retDecorator = decorators[location][i++].decorator(
      element,
      decoratorRadius,
      x,
      y,
    );
  }
  return retDecorator as React.ReactElement;
};

export const getNodeDecorators = (
  element: Node,
  decorators: { [key: string]: TopologyDecorator[] },
  decoratorRadius: number,
): React.ReactNode => {
  const keys = decorators ? Object.keys(decorators) : [];
  return (
    <>
      {keys.map(key =>
        getExtensionDecoratorForQuadrant(
          key,
          element,
          decorators,
          decoratorRadius,
        ),
      )}
    </>
  );
};
