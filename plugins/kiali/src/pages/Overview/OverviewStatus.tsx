import * as React from 'react';

import { Tooltip } from '@material-ui/core';

import { healthFilter } from '../../components/Filters/CommonFilters';
import { FilterSelected } from '../../components/Filters/StatefulFilters';
import { healthIndicatorStyle } from '../../components/Health/HealthStyle';
import { createIcon } from '../../components/Health/Helper';
import { Paths } from '../../config';
import { DurationInSeconds, IntervalInMilliseconds } from '../../types/Common';
import { ActiveFilter, DEFAULT_LABEL_OPERATION } from '../../types/Filters';
import { Status } from '../../types/Health';

type Props = {
  id: string;
  namespace: string;
  status: Status;
  items: string[];
  targetPage: Paths;
  duration: DurationInSeconds;
  refreshInterval: IntervalInMilliseconds;
};

export class OverviewStatus extends React.Component<Props, {}> {
  setFilters = () => {
    const filters: ActiveFilter[] = [
      {
        category: healthFilter.category,
        value: this.props.status.name,
      },
    ];
    FilterSelected.setSelected({
      filters: filters,
      op: DEFAULT_LABEL_OPERATION,
    });
  };

  render() {
    const length = this.props.items.length;
    let items = this.props.items;
    if (items.length > 6) {
      items = items.slice(0, 5);
      items.push(`and ${length - items.length} more...`);
    }
    const tooltipContent = (
      <div>
        <strong>{this.props.status.name}</strong>
        {items.map((app, idx) => {
          return (
            <div
              data-test={`${this.props.id}-${app}`}
              key={`${this.props.id}-${idx}`}
            >
              <span style={{ marginRight: '10px' }}>
                {createIcon(this.props.status, 'sm')}
              </span>{' '}
              {app}
            </div>
          );
        })}
      </div>
    );

    return (
      <>
        <Tooltip
          aria-label="Overview status"
          placement="top"
          title={tooltipContent}
          className={healthIndicatorStyle}
        >
          <div style={{ display: 'inline-block', marginRight: '5px' }}>
            {createIcon(this.props.status)}
            {` ${length}`}
          </div>
        </Tooltip>
      </>
    );
  }
}
