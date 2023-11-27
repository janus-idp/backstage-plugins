import * as React from 'react';

import { Chip } from '@material-ui/core';

type Props = {
  version: string;
  isCanary: boolean;
};

export class ControlPlaneVersionBadge extends React.Component<Props> {
  render() {
    return (
      <Chip
        label={this.props.version}
        size="small"
        style={{
          color: 'white',
          marginLeft: 5,
          backgroundColor: this.props.isCanary ? 'blue' : 'orange',
        }}
      />
    );
  }
}
