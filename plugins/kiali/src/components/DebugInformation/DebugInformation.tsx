// @ts-nocheck
import * as React from 'react';
import AceEditor from 'react-ace';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import {
  CardTab,
  TabbedCard,
  Table,
  TableColumn,
} from '@backstage/core-components';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@material-ui/core';
import {
  Alert,
  AlertActionCloseButton,
  AlertVariant,
} from '@patternfly/react-core';

import { serverConfig } from '../../config';
import { authenticationConfig } from '../../config/AuthenticationConfig';
import { ComputedServerConfig } from '../../config/ServerConfig';
import { KialiAppState } from '../../store/Store';
import { istioAceEditorStyle } from '../../styles/AceEditorStyle';
import { AuthConfig } from '../../types/Auth';
import { aceOptions } from '../../types/IstioConfigDetails';

const beautify = require('json-beautify');

enum CopyStatus {
  NOT_COPIED, // We haven't copied the current output
  COPIED, // Current output is in the clipboard
  OLD_COPY, // We copied the prev output, but there are changes in the KialiAppState
}

type DebugInformationProps = {
  appState: KialiAppState;
  showDebug: boolean;
  setShowDebug: React.Dispatch<React.SetStateAction<boolean>>;
};

type DebugInformationData = {
  backendConfigs: {
    authenticationConfig: AuthConfig;
    computedServerConfig: ComputedServerConfig;
  };
  currentURL: string;
  reduxState: KialiAppState;
};

const copyToClipboardOptions = {
  message:
    'We failed to automatically copy the text, please use: #{key}, Enter\t',
};

// Will be shown in Kiali Config and hidden in Additional state
const propsToShow = [
  'accessibleNamespaces',
  'authStrategy',
  'clusters',
  'gatewayAPIClasses',
  'gatewayAPIEnabled',
  'istioConfigMap',
  'istioIdentityDomain',
  'istioNamespace',
  'istioStatusEnabled',
  'logLevel',
  'istioCanaryRevision',
  'istioAnnotationsAction',
  'istioInjectionAction',
];

const propsToPatch = ['cyRef', 'summaryTarget', 'token', 'username'];

const defaultTab = 'kialiConfig';

export const DebugInformation = (props: DebugInformationProps) => {
  const aceEditorRef: React.RefObject<AceEditor> = React.createRef();
  let kialiConfig: { [key: string]: string } = {};

  for (const key in serverConfig) {
    if (propsToShow.includes(key)) {
      // @ts-expect-error
      if (typeof serverConfig[key] === 'string') {
        // @ts-expect-error
        kialiConfig[key] = serverConfig[key];
      } else {
        // @ts-expect-error
        kialiConfig[key] = JSON.stringify(serverConfig[key]);
      }
    }
  }

  kialiConfig = Object.keys(kialiConfig)
    .sort((a, b) => a.localeCompare(b))
    .reduce((obj, key) => {
      // @ts-expect-error
      obj[key] = kialiConfig[key];
      return obj;
    }, {});

  const [currentTab, setCurrentTab] = React.useState<string>(defaultTab);
  const [copyStatus, setCopyStatus] = React.useState<CopyStatus>(
    CopyStatus.NOT_COPIED,
  );

  const close = () => {
    props.setShowDebug(false);
  };

  const copyCallback = (_text: string, result: boolean) => {
    setCopyStatus(result ? CopyStatus.COPIED : CopyStatus.NOT_COPIED);
  };

  // Properties shown in Kiali Config are not shown again in Additional State
  const filterDebugInformation = (info: any) => {
    if (info !== null) {
      for (const [key] of Object.entries(info)) {
        if (propsToShow.includes(key)) {
          delete info[key];
          continue;
        }
      }
    }
    return info;
  };

  const parseConfig = (key: string, value: any) => {
    // We have to patch some runtime properties  we don't want to serialize
    if (propsToPatch.includes(key)) {
      return null;
    }
    return value;
  };

  const renderDebugInformation = () => {
    let debugInformation: DebugInformationData = {
      backendConfigs: {
        authenticationConfig: authenticationConfig,
        computedServerConfig: serverConfig,
      },
      currentURL: window.location.href,
      reduxState: props.appState,
    };
    debugInformation = filterDebugInformation(debugInformation);
    return beautify(debugInformation, parseConfig, 2);
  };

  const getCopyText = (): string => {
    const text =
      currentTab === 'kialiConfig'
        ? JSON.stringify(kialiConfig, null, 2)
        : renderDebugInformation();
    return text;
  };

  const download = () => {
    const element = document.createElement('a');
    const file = new Blob([getCopyText()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `debug_${
      currentTab === 'kialiConfig' ? 'kiali_config' : 'additional_state'
    }.json`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const hideAlert = () => {
    setCopyStatus(CopyStatus.NOT_COPIED);
  };

  const debugInformation = renderDebugInformation();

  const columns = (): TableColumn[] => {
    return [
      { title: 'Configuration', field: 'configuration' },
      { title: 'Value', field: 'value' },
    ];
  };

  const getRows = () => {
    const conf: Array<{}> = [];

    for (const [k, v] of Object.entries(kialiConfig)) {
      if (typeof v !== 'string') {
        conf.push({ configuration: k, value: JSON.stringify(v) });
      } else {
        conf.push({ configuration: k, value: v });
      }
    }
    return conf;
  };

  const renderTabs = () => {
    const copyClip = (
      <CopyToClipboard
        onCopy={copyCallback}
        text={getRows()}
        options={copyToClipboardOptions}
      >
        <Table columns={columns()} data={getRows()} />
      </CopyToClipboard>
    );

    const kialiConfigCard = (
      <CardTab label="Kiali Config" key="kialiConfig">
        {copyClip}
      </CardTab>
    );

    const additionalState = (
      <CardTab label="Additional State" key="additionalState">
        <span>Please include this information when opening a bug:</span>
        <CopyToClipboard
          onCopy={copyCallback}
          text={debugInformation}
          options={copyToClipboardOptions}
        >
          <AceEditor
            ref={aceEditorRef}
            mode="yaml"
            theme="eclipse"
            width="100%"
            className={istioAceEditorStyle}
            wrapEnabled
            readOnly
            setOptions={aceOptions || { foldStyle: 'markbegin' }}
            value={debugInformation}
          />
        </CopyToClipboard>
      </CardTab>
    );
    // TODO additionalState
    const tabsArray: JSX.Element[] = [kialiConfigCard];
    return tabsArray;
  };

  return props.showDebug ? (
    <Dialog
      open={props.showDebug}
      onClose={close}
      aria-labelledby="Debug information"
      aria-describedby="Debug information"
      fullWidth
    >
      <DialogTitle>Debug information</DialogTitle>
      <DialogContent>
        {copyStatus === CopyStatus.COPIED && (
          <Alert
            style={{ marginBottom: '20px' }}
            title="Debug information has been copied to your clipboard."
            variant={AlertVariant.success}
            isInline
            actionClose={<AlertActionCloseButton onClose={hideAlert} />}
          />
        )}
        {copyStatus === CopyStatus.OLD_COPY && (
          <Alert
            style={{ marginBottom: '20px' }}
            title="Debug information was copied to your clipboard, but is outdated now. It could be caused by new data received by auto refresh timers."
            variant={AlertVariant.warning}
            isInline
            actionClose={<AlertActionCloseButton onClose={hideAlert} />}
          />
        )}
        <TabbedCard
          value={currentTab}
          onChange={(_, tabName) => setCurrentTab(tabName as string)}
        >
          {renderTabs()}
        </TabbedCard>
      </DialogContent>
      <DialogActions style={{ display: 'block' }}>
        <Button onClick={close} variant="contained">
          Close
        </Button>
        <CopyToClipboard
          onCopy={copyCallback}
          text={getCopyText()}
          options={copyToClipboardOptions}
        >
          <Button variant="contained">Copy</Button>
        </CopyToClipboard>
        <Button variant="contained" onClick={download}>
          Download
        </Button>
      </DialogActions>
    </Dialog>
  ) : null;
};
