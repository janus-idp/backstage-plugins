import React from 'react';

import { Tooltip } from '@material-ui/core';

import { Status } from '@janus-idp/backstage-plugin-kiali-common';

import { createHealthIcon } from '../../../../helper';

type OverviewStatusProps = {
  id: string;
  namespace: string;
  status: Status;
  items: string[];
};
export const OverviewStatus = (props: OverviewStatusProps) => {
  const length = props.items.length;
  let items = props.items;
  if (items.length > 6) {
    items = items.slice(0, 5);
    items.push(`and ${length - items.length} more...`);
  }
  const tooltipContent = (
    <>
      <strong>{props.status.name}</strong>
      {items.map((app, idx) => {
        return (
          <div data-test={`${props.id}-${app}`} key={`${props.id}-${idx}`}>
            <span style={{ marginRight: '10px' }}>
              {createHealthIcon(props.status)}
            </span>{' '}
            {app}
          </div>
        );
      })}
    </>
  );
  return (
    <Tooltip title={tooltipContent} placement="right">
      <div data-test={`health_action_${props.namespace}`}>
        {createHealthIcon(props.status)}
        {` ${length}`}
      </div>
    </Tooltip>
  );
};
