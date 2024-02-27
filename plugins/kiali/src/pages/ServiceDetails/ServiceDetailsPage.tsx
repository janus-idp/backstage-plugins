import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useAsyncFn, useDebounce } from 'react-use';

import { Content } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress } from '@material-ui/core';

import { HistoryManager } from '../../app/History';
import { BreadcrumbView } from '../../components/BreadcrumbView/BreadcrumbView';
import { DefaultSecondaryMasthead } from '../../components/DefaultSecondaryMasthead/DefaultSecondaryMasthead';
import * as FilterHelper from '../../components/FilterList/FilterHelper';
import { TimeDurationComponent } from '../../components/Time/TimeDurationComponent';
import { getErrorString, kialiApiRef } from '../../services/Api';
import { KialiContext } from '../../store';
import { KialiAppState } from '../../store/Store';
import { baseStyle } from '../../styles/StyleUtils';
import { Validations } from '../../types/IstioObjects';
import { ServiceDetailsInfo } from '../../types/ServiceInfo';
import { ServiceInfo } from './ServiceInfo';

export const ServiceDetailsPage = () => {
  const { namespace, service } = useParams();
  const kialiClient = useApi(kialiApiRef);
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [serviceItem, setServiceItem] = React.useState<ServiceDetailsInfo>();
  const [duration, setDuration] = React.useState<number>(
    FilterHelper.currentDuration(),
  );
  const cluster = HistoryManager.getClusterName();
  const [validations, setValidations] = React.useState<Validations>();

  const grids = () => {
    const elements = [];
    elements.push(
      <TimeDurationComponent
        key="DurationDropdown"
        id="service-list-duration-dropdown"
        disabled={false}
        duration={duration.toString()}
        setDuration={setDuration}
        label="From:"
      />,
    );
    return elements;
  };

  const fetchService = async () => {
    kialiClient
      .getServiceDetail(
        namespace ? namespace : '',
        service ? service : '',
        true,
        cluster,
        duration,
      )
      .then((serviceResponse: ServiceDetailsInfo) => {
        setServiceItem(serviceResponse);
        setValidations(serviceResponse.validations);
      })
      .catch(err => {
        kialiState.alertUtils!.add(
          `Could not fetch service: ${getErrorString(err)}`,
        );
      });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await fetchService();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (loading) {
    return <CircularProgress />;
  }

  const overviewTab = (): React.ReactElement => {
    return (
      <>
        {serviceItem && (
          <ServiceInfo
            service={service ? service : ''}
            duration={duration}
            namespace={namespace ? namespace : ''}
            validations={validations ? validations : {}}
            cluster={cluster}
            serviceDetails={serviceItem}
            gateways={[]}
            k8sGateways={[]}
            peerAuthentications={[]}
            istioAPIEnabled
          />
        )}
      </>
    );
  };

  return (
    <div className={baseStyle}>
      <Content>
        <BreadcrumbView />
        <DefaultSecondaryMasthead
          elements={grids()}
          onRefresh={() => fetchService()}
        />
        <div style={{ marginTop: '20px' }}>{overviewTab()}</div>
      </Content>
    </div>
  );
};
