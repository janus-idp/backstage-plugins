import * as React from 'react';

import Decorator from './Decorator';

type PipelineDecoratorBubbleProps = React.ComponentProps<typeof Decorator> & {
  children: React.ReactNode;
  radius: number;
  x: number;
  y: number;
};

const PipelineDecoratorBubble: React.FC<PipelineDecoratorBubbleProps> = ({
  children,
  radius,
  x,
  y,
  ...otherDecoratorProps
}) => (
  <Decorator x={x} y={y} radius={radius} {...otherDecoratorProps}>
    <g transform="translate(-10, -12)">
      <foreignObject width={20} height={20}>
        {children}
      </foreignObject>
    </g>
  </Decorator>
);

export default PipelineDecoratorBubble;
