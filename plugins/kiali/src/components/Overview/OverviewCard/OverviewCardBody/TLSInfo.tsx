import * as React from 'react';

import { Chip, Grid, Tooltip } from '@material-ui/core';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import LockRounded from '@material-ui/icons/LockRounded';

import { CertsInfo } from '@janus-idp/backstage-plugin-kiali-common';

type Props = {
  certificatesInformationIndicators?: boolean;
  version?: string;
  certsInfo?: CertsInfo[];
};

const generateRow = (item: CertsInfo) => {
  return (
    <div key="showCerts">
      <div
        style={{
          display: 'inline-block',
          width: '125px',
          whiteSpace: 'nowrap',
        }}
      >
        From {item.issuer}
      </div>
      <div>
        <div>Issuer: </div>
        <div>{item.secretName}</div>
      </div>
      <div>
        <div>Valid From: </div>
        <div>{item.notAfter}</div>
      </div>
      <div>
        <div>Valid To: </div>
        <div>{item.notBefore}</div>
      </div>
    </div>
  );
};

const showCerts = (certs: CertsInfo[] | undefined) => {
  if (certs) {
    const rows = certs.map(item => generateRow(item));
    return <div>{rows}</div>;
  }

  return 'No cert info';
};

const LockIcon = (props: Props) => {
  return props.certificatesInformationIndicators === true ? (
    <Tooltip placement="top" title={showCerts(props.certsInfo)}>
      <div data-test="lockerCA">
        <LockRounded fontSize="small" />
      </div>
    </Tooltip>
  ) : (
    <LockRounded fontSize="small" />
  );
};

const chipContent = (props: Props) => {
  return (
    <Grid container>
      <Grid item style={{ marginTop: '8px' }}>
        {props.version}
      </Grid>
      <Grid item style={{ marginTop: '5px' }}>
        <LockIcon
          certificatesInformationIndicators={
            props.certificatesInformationIndicators
          }
          certsInfo={props.certsInfo}
        />
      </Grid>
      <Grid item style={{ marginTop: '5px' }}>
        <Tooltip
          placement="right"
          title={
            <div style={{ textAlign: 'left' }}>
              The meshConfig.meshMTLS.minProtocolVersion field specifies the
              minimum TLS version for the TLS connections among Istio workloads.
              N/A if it was not set.
            </div>
          }
        >
          <InfoOutlined style={{ fontSize: 20, color: '#2b9af3' }} />
        </Tooltip>
      </Grid>
    </Grid>
  );
};

export const TLSInfo = (props: Props) => {
  return (
    <div style={{ textAlign: 'left' }}>
      <div>
        <div
          style={{
            display: 'inline-block',
            width: '125px',
            whiteSpace: 'nowrap',
          }}
        >
          Min TLS version
        </div>
        <Chip
          size="small"
          style={{ color: '#002952', backgroundColor: '#e7f1fa' }}
          label={chipContent(props)}
        />
      </div>
    </div>
  );
};
