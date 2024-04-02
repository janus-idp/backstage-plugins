import * as React from 'react';

import { Card, CardContent, CardHeader, Typography } from '@material-ui/core';

import { DetailDescription } from '../../components/DetailDescription/DetailDescription';
import { HealthIndicator } from '../../components/Health/HealthIndicator';
import { Labels } from '../../components/Label/Labels';
import { PFBadge, PFBadges } from '../../components/Pf/PfBadges';
import { isMultiCluster, serverConfig } from '../../config';
import { kialiStyle } from '../../styles/StyleUtils';
import { App } from '../../types/App';
import * as H from '../../types/Health';

type AppDescriptionProps = {
  app?: App;
  health?: H.Health;
};

const iconStyle = kialiStyle({
  display: 'inline-block',
});

const healthIconStyle = kialiStyle({
  marginLeft: '0.5rem',
  verticalAlign: '-0.075rem',
});

export const AppDescription: React.FC<AppDescriptionProps> = (
  props: AppDescriptionProps,
) => {
  const appLabels: { [key: string]: string } = {};

  if (props.app) {
    appLabels[serverConfig.istioLabels.appLabelName] = props.app.name;
  }

  return props.app ? (
    <Card id="AppDescriptionCard" data-test="app-description-card">
      <CardHeader>
        <Typography variant="h6" style={{ margin: '10px' }}>
          <div key="service-icon" className={iconStyle}>
            <PFBadge badge={PFBadges.App} />
          </div>

          {props.app.name}

          <span className={healthIconStyle}>
            <HealthIndicator id={props.app.name} health={props.health} />
          </span>
        </Typography>

        {props.app.cluster && isMultiCluster && (
          <div key="cluster-icon" style={{ paddingBottom: '0.5rem' }}>
            <PFBadge badge={PFBadges.Cluster} /> {props.app.cluster}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Labels
          labels={appLabels}
          tooltipMessage={`Workloads and Services grouped by ${serverConfig.istioLabels.appLabelName} label`}
        />

        <DetailDescription
          namespace={props.app ? props.app.namespace.name : ''}
          workloads={props.app ? props.app.workloads : []}
          services={props.app ? props.app.serviceNames : []}
          health={props.health}
          cluster={props.app?.cluster}
        />
      </CardContent>
    </Card>
  ) : (
    <>Loading</>
  );
};
