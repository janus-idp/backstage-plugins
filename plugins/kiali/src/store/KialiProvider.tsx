import React from 'react';
import { useAsyncFn, useDebounce } from 'react-use';

import { Entity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress } from '@material-ui/core';
import axios from 'axios';

import {
  HelpDropdownActions,
  LoginActions,
  NamespaceActions,
} from '../actions';
import { IstioCertsInfoActions } from '../actions/IstioCertsInfoActions';
import { IstioStatusActions } from '../actions/IstioStatusActions';
import { MeshTlsActions } from '../actions/MeshTlsActions';
import { setServerConfig } from '../config/ServerConfig';
import { KialiHelper } from '../pages/Kiali/KialiHelper';
import { KialiNoResources } from '../pages/Kiali/KialiNoResources';
import {
  GlobalStateReducer,
  GraphDataStateReducer,
  HelpDropdownStateReducer,
  IstioCertsInfoStateReducer,
  IstioStatusStateReducer,
  LoginReducer,
  MessageCenterReducer,
  NamespaceStateReducer,
  TourStateReducer,
  TracingStateReducer,
  UserSettingsStateReducer,
} from '../reducers';
import { MeshTlsStateReducer } from '../reducers/MeshTlsState';
import { kialiApiRef } from '../services/Api';
import { AuthInfo } from '../types/Auth';
import { MessageType } from '../types/MessageCenter';
import { AlertUtils } from '../utils/Alertutils';
import { PromisesRegistry } from '../utils/CancelablePromises';
import { initialStore } from './ConfigStore';
import { KialiContext } from './Context';

export type KialiChecker = {
  verify: boolean;
  missingAttributes?: string[];
  message?: string;
  helper?: string;
  authData?: AuthInfo;
};

const initialChecker: KialiChecker = {
  verify: true,
};

interface Props {
  children: React.ReactNode;
  entity?: Entity;
}

export const KialiProvider: React.FC<Props> = ({
  children,
  entity,
}): JSX.Element => {
  const promises = new PromisesRegistry();
  const [kialiCheck, setKialiCheck] =
    React.useState<KialiChecker>(initialChecker);
  const [notHaveResources, setNotHaveResources] = React.useState<
    boolean | undefined
  >(undefined);
  
  
  /* Store state and dispatch */
  const [graphState, graphDispatch] = React.useReducer(
    GraphDataStateReducer,
    initialStore.graph,
  );
  const [loginState, loginDispatch] = React.useReducer(
    LoginReducer,
    initialStore.authentication,
  );
  const [globalState, globalStateDispatch] = React.useReducer(
    GlobalStateReducer,
    initialStore.globalState,
  );
  const [meshTLSStatusState, meshTLSStatusDispatch] = React.useReducer(
    MeshTlsStateReducer,
    initialStore.meshTLSStatus,
  ); 
  const [messageState, messageDispatch] = React.useReducer(
    MessageCenterReducer,
    initialStore.messageCenter,
  );
  const [namespaceState, namespaceDispatch] = React.useReducer(
    NamespaceStateReducer,
    initialStore.namespaces,
  );
  const [statusState, statusDispatch] = React.useReducer(
    HelpDropdownStateReducer,
    initialStore.statusState,
  );
  const [tourState, tourDispatch] = React.useReducer(
    TourStateReducer,
    initialStore.tourState,
  );
  const [tracingState, tracingDispatch] = React.useReducer(
    TracingStateReducer,
    initialStore.tracingState,
  );
  const [userSettingState, userSettingDispatch] = React.useReducer(
    UserSettingsStateReducer,
    initialStore.userSettings,
  );
  const [istioStatusState, istioStatusDispatch] = React.useReducer(
    IstioStatusStateReducer,
    initialStore.istioStatus,
  );
  const [istioCertsState, istioCertsDispatch] = React.useReducer(
    IstioCertsInfoStateReducer,
    initialStore.istioCertsInfo,
  );

  /* End Store state and dispatch */

  const kialiClient = useApi(kialiApiRef);
  kialiClient.setEntity(entity);
  const alertUtils = new AlertUtils(messageDispatch);

  const fetchNamespaces = async () => {
    if (!namespaceState || !namespaceState.isFetching) {
      namespaceDispatch(NamespaceActions.requestStarted());
      return kialiClient
        .getNamespaces()
        .then(data => {
          namespaceDispatch(
            NamespaceActions.receiveList([...data], new Date()),
          );
          if (data.length > 0) {
            setNotHaveResources(false);
          } else {
            setNotHaveResources(true);
          }
          namespaceDispatch(NamespaceActions.setActiveNamespaces([...data]));
        })
        .catch(() => namespaceDispatch(NamespaceActions.requestFailed()));
    }
    return () => {};
  };

  const fetchPostLogin = async () => {
    try {
      const getAuthpromise = promises
        .register('getAuth', kialiClient.getAuthInfo())
        .then(response => {
          loginDispatch(LoginActions.loginSuccess(response.sessionInfo));
        });
      const getStatusPromise = promises
        .register('getStatus', kialiClient.getStatus())
        .then(response => {
          statusDispatch(HelpDropdownActions.statusRefresh(response));
        });
      const getMeshTLS = promises
        .register('getMeshTLS', kialiClient.getMeshTls())
        .then(response =>
          meshTLSStatusDispatch(MeshTlsActions.setinfo(response)),
        );
      const getIstioCerts = promises
        .register('getIstioCerts', kialiClient.getIstioCertsInfo())
        .then(resp => istioCertsDispatch(IstioCertsInfoActions.setinfo(resp)));
      const getServerConfig = promises
        .register('getServerConfig', kialiClient.getServerConfig())
        .then(resp => setServerConfig(resp));
      const getIstioStatus = promises
        .register('getIstiostatus', kialiClient.getIstioStatus())
        .then(resp => istioStatusDispatch(IstioStatusActions.setinfo(resp)));

      await Promise.all([
        getAuthpromise,
        getStatusPromise,
        getServerConfig,
        getMeshTLS,
        getIstioCerts,
        getIstioStatus,
      ]);
      await fetchNamespaces();
    } catch (err) {
      let errDetails: string | undefined = undefined;
      if (axios.isAxiosError(err)) {
        if (err.request) {
          const response = (err.request as XMLHttpRequest).responseText;
          if (response.trim().length > 0) {
            errDetails = response;
          }
        }
      }
      setKialiCheck({
        verify: false,
        message: `Error in axios: ${errDetails || err}`,
      });
    }
  };

  const fetchKiali = async () => {
    try {
      const status = await kialiClient.status();
      if ('verify' in status && !status.verify) {
        alertUtils.addError('Could not check configuration and authenticate');
        setKialiCheck(status);
      } else {
        fetchPostLogin();
      }
    } catch (err) {
      let errDetails: string | undefined = undefined;
      if (axios.isAxiosError(err)) {
        if (err.request) {
          const response = (err.request as XMLHttpRequest).responseText;
          if (response.trim().length > 0) {
            errDetails = response;
          }
        }
        alertUtils.addError('Could not fetch auth info', err);
      }
      setKialiCheck({
        verify: false,
        message: `Could not fetch auth info: ${errDetails || err}`,
      });
    }
  };

  const mockAlerts = () => {
    alertUtils.addMessage({
      content:
        '[Mock]Could not fetch Grafana info. Turning off links to Grafana.',
      detail: 'grafathis.props.toggleLegendna URL is not set in Kiali configuration',
      group: 'default',
      type: MessageType.INFO,
      showNotification: false,
    });
    alertUtils.addMessage({
      content: '[Mock]Could not fetch Graph.',
      detail: 'Mock error fetching graph',
    });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await fetchKiali();
      if (kialiClient.isDevEnv()) {
        mockAlerts();
      }
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (loading) {
    return <CircularProgress />;
  } else if (!!notHaveResources) {
    return <KialiNoResources entity={entity!} />;
  }

  return (
    <KialiContext.Provider
      value={{
        globalState: globalState,
        authentication: loginState,        
        graph: graphState,
        messageCenter: messageState,
        meshTLSStatus: meshTLSStatusState,
        namespaces: namespaceState,
        userSettings: userSettingState,
        istioStatus: istioStatusState,
        istioCertsState: istioCertsState,
        statusState: statusState,
        tourState: tourState,
        tracingState: tracingState,
        dispatch: {
          globalStateDispatch: globalStateDispatch,
          graphDispatch: graphDispatch,
          istioStatusDispatch: istioStatusDispatch,
          messageDispatch: messageDispatch,
          namespaceDispatch: namespaceDispatch,
          tracingDispatch: tracingDispatch,
          tourDispatch: tourDispatch,
          userSettingDispatch: userSettingDispatch,
        },
        alertUtils: alertUtils,
      }}
    >
      {kialiCheck.verify ? children : <KialiHelper check={kialiCheck} />}
    </KialiContext.Provider>
  );
};
