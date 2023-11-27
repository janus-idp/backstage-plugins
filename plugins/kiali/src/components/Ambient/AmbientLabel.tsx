import * as React from 'react';

import { Chip, Tooltip } from '@material-ui/core';

type AmbientLabelProps = {
  tooltip: boolean;
  style?: React.CSSProperties;
  waypoint?: boolean;
};

const AmbientComponent = 'ztunnel';

export class AmbientLabel extends React.Component<AmbientLabelProps, {}> {
  render() {
    const msg = 'Component is labeled as part of the Istio Ambient Mesh';

    const tooltipContent = (
      <div style={{ textAlign: 'left' }}>
        <div>
          {msg}
          <br />
        </div>
      </div>
    );
    const iconComponent = (
      <span style={this.props.style}>
        <Chip
          style={{ marginLeft: 5, backgroundColor: '#e7f1fa' }}
          size="small"
          label={AmbientComponent}
        />
        {this.props.waypoint && (
          <Chip
            style={{ marginLeft: 5, backgroundColor: '#e7f1fa' }}
            size="small"
            label="Waypoint"
          />
        )}
        {!this.props.tooltip && (
          <span style={{ marginLeft: '8px' }}>
            {msg}
            <Tooltip
              key="tooltip_ambient_label"
              placement="top"
              title={tooltipContent}
            >
              <Chip
                style={{ marginLeft: 5, backgroundColor: '#e7f1fa' }}
                size="small"
                label={AmbientComponent}
              />
            </Tooltip>
          </span>
        )}
      </span>
    );
    return this.props.tooltip ? (
      <Tooltip
        key="tooltip_ambient_label"
        placement="right"
        title={tooltipContent}
      >
        <span>{iconComponent}</span>
      </Tooltip>
    ) : (
      iconComponent
    );
  }
}
