import * as React from 'react';

import { PFColors } from '../../components/Pf/PfColors';
import { kialiStyle } from '../../styles/StyleUtils';
import {
  isProxyStatusComponentSynced,
  isProxyStatusSynced,
  ProxyStatus,
} from '../../types/Health';

type Props = {
  status?: ProxyStatus;
};

const smallStyle = kialiStyle({ fontSize: '70%', color: PFColors.White });
const colorStyle = kialiStyle({ fontSize: '1.1rem', color: PFColors.White });

export class ProxyStatusList extends React.Component<Props> {
  statusList = () => {
    if (!this.props.status) {
      return [];
    }

    return [
      { c: 'CDS', s: this.props.status.CDS },
      { c: 'EDS', s: this.props.status.EDS },
      { c: 'LDS', s: this.props.status.LDS },
      { c: 'RDS', s: this.props.status.RDS },
    ].map((value: { c: string; s: string }, _: number) => {
      if (!isProxyStatusComponentSynced(value.s)) {
        const status = value.s ? value.s : '-';
        return <div className={smallStyle}>{`${value.c}: ${status}`}</div>;
      }
      return null;
    });
  };

  render() {
    if (this.props.status && !isProxyStatusSynced(this.props.status)) {
      return (
        <div>
          <span className={colorStyle}>Istio Proxy Status</span>
          {this.statusList()}
        </div>
      );
    }
    return null;
  }
}
