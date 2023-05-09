import React, { useState } from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useDebounce from 'react-use/lib/useDebounce';

import { Entity } from '@backstage/catalog-model';
import { CodeSnippet, WarningPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { CircularProgress, Grid } from '@material-ui/core';

import {
  CanaryUpgradeStatus,
  ComponentStatus,
  IstiodResourceThresholds,
  KialiConfigT,
  KialiFetchError,
  NamespaceInfo,
  OutboundTrafficPolicy,
  OverviewData,
  OverviewType,
} from '@janus-idp/backstage-plugin-kiali-common';

import { kialiApiRef } from '../../api';
import { KialiEndpoints } from '../../api/apiClient';
import { calculateHealth } from './health';
import { OverviewCard } from './OverviewCard';
import { OverviewToolbar } from './OverviewToolbar';

export declare enum OverviewDisplayMode {
  COMPACT = 0,
  EXPAND = 1,
  LIST = 2,
}

declare const directionTypes: {
  inbound: string;
  outbound: string;
};
export type DirectionType = keyof typeof directionTypes;

type OverviewProps = {
  entity: Entity;
  refreshIntervalMs?: number;
  kialiConfig: KialiConfigT;
};

export const Overview = (props: OverviewProps) => {
  const kialiClient = useApi(kialiApiRef);
  kialiClient.setEntity(useEntity().entity);
  const [namespaces, setNamespaces] = useState<NamespaceInfo[]>([]);
  const [canaryStatus, setCanaryStatus] = React.useState<
    CanaryUpgradeStatus | undefined
  >(undefined);
  const [canaryUpgrade, setCanaryUpgrade] = React.useState<boolean>(false);
  const [componentStatus, setComponentStatus] = React.useState<
    ComponentStatus[]
  >([]);
  const [direction, setDirection] = React.useState<DirectionType>('inbound');
  const [duration, setDuration] = React.useState<number>(600);
  const [overviewType, setOverviewType] = React.useState<OverviewType>('app');
  const [outboundTrafficPolicy, setoutboundTrafficPolicy] =
    React.useState<OutboundTrafficPolicy>({ mode: '' });
  const [istiodResourceThresholds, setIstiodResourceThresholds] =
    React.useState<IstiodResourceThresholds | undefined>(undefined);
  const [errors, setErrors] = React.useState<KialiFetchError[]>([]);
  const [warnings, setWarnings] = React.useState<KialiFetchError[]>([]);

  const fetchInfo = (
    config: KialiConfigT = props.kialiConfig,
    dur: number = duration,
    ovType: OverviewType = overviewType,
    dir: DirectionType = direction,
  ) => {
    kialiClient
      .get(KialiEndpoints.getOverview, {
        duration: dur,
        overviewType: ovType,
        direction: dir,
      })
      .then(response => {
        if (response.errors.length > 0) {
          setErrors(response.errors);
        } else {
          if (response.warnings.length > 0) {
            setWarnings(response.warnings);
          }
          const ovData = response.response as OverviewData;
          const ns = ovData.namespaces;
          try {
            ns.forEach((n, i) => {
              ns[i] = calculateHealth(config!.server, ovType, n, dur);
            });
          } catch (e) {
            const newWarnings = warnings;
            newWarnings.push({
              errorType: 'SYSTEM_ERROR',
              message: `Error calculating Health : ${e}`,
            });
            setWarnings(newWarnings);
          }
          setNamespaces(ns);
          setIstiodResourceThresholds(ovData.istiodResourceThresholds);
          setoutboundTrafficPolicy(ovData.outboundTraffic || { mode: '' });
          setComponentStatus(ovData.istioStatus || []);
          setCanaryStatus(ovData.canaryUpgrade);
          setCanaryUpgrade(
            ovData.canaryUpgrade!.pendingNamespaces.length > 0 ||
              ovData.canaryUpgrade!.migratedNamespaces.length > 0,
          );
        }
      })
      .catch(e => {
        throw new Error(e);
      });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      fetchInfo();
    },
    [duration, overviewType, direction],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (errors.length > 0) {
    const message = errors
      .map(
        e =>
          `Error ${e.errorType.toString()}, Code: ${e.statusCode} fetching ${
            e.resourcePath
          } :  ${e.message}`,
      )
      .join('\n');
    return (
      <WarningPanel severity="error" title="Could not fetch info from Kiali.">
        <CodeSnippet language="text" text={message} />
      </WarningPanel>
    );
  }

  if (loading) {
    return <CircularProgress />;
  }

  const handleToolbar = (
    dur: number = duration,
    ovType: OverviewType = overviewType,
    dir: DirectionType = direction,
  ) => {
    fetchInfo(props.kialiConfig, dur, ovType, dir);
    setDuration(dur);
    setOverviewType(ovType);
    setDirection(dir);
  };

  return (
    <>
      {warnings.length > 0 && (
        <WarningPanel title="We found some warnings">
          <CodeSnippet
            language="text"
            text={warnings
              .map(
                e =>
                  `Error ${e.errorType.toString()},${
                    e.statusCode ? `Code: ${e.statusCode}` : ''
                  } ${e.resourcePath ? ` fetching ${e.resourcePath}` : ''} :  ${
                    e.message
                  }`,
              )
              .join('\n')}
          />
        </WarningPanel>
      )}
      <OverviewToolbar
        refresh={() => handleToolbar(duration, overviewType, direction)}
        duration={duration}
        setDuration={e => handleToolbar(e, overviewType, direction)}
        overviewType={overviewType}
        setOverviewType={e => handleToolbar(duration, e, direction)}
        direction={direction}
        setDirection={e => handleToolbar(duration, overviewType, e)}
      />
      <Grid container direction="column">
        {namespaces.map((ns, _) => (
          <OverviewCard
            canaryStatus={canaryStatus}
            canaryUpgrade={canaryUpgrade}
            direction={direction}
            duration={duration}
            ns={ns}
            outboundTrafficPolicy={outboundTrafficPolicy}
            kialiConfig={props.kialiConfig}
            type={overviewType}
            istiodResourceThresholds={istiodResourceThresholds}
            istioStatus={componentStatus}
          />
        ))}
      </Grid>
    </>
  );
};
