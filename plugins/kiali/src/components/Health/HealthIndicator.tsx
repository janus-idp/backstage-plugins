import * as React from 'react';

import { PopoverPosition, Tooltip } from '@patternfly/react-core';

import { createTooltipIcon } from '../../config/KialiIcon';
import * as H from '../../types/Health';
import { HealthDetails } from './HealthDetails';
import { healthIndicatorStyle } from './HealthStyle';
import { createIcon } from './Helper';

interface HealthIndicatorProps {
  health?: H.Health;
  id: string;
  tooltipPlacement?: PopoverPosition;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = (
  props: HealthIndicatorProps,
) => {
  const globalStatus = props.health ? props.health.getGlobalStatus() : H.NA;

  if (props.health) {
    const icon = createIcon(globalStatus);

    return (
      <Tooltip
        aria-label="Health indicator"
        content={
          <div>
            <strong>{globalStatus.name}</strong>
            <HealthDetails health={props.health} />
          </div>
        }
        position={PopoverPosition.auto}
        className={healthIndicatorStyle}
      >
        {createTooltipIcon(icon)}
      </Tooltip>
    );
  }

  return <span />;
};
