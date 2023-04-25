import { Button, makeStyles, TextField } from '@material-ui/core';
import React, { useCallback, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from 'xterm-addon-attach';
import { InfoCard, Progress } from '@backstage/core-components';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  createWorkspace,
  getDefaultNamespace,
  getNamespaces,
  getWorkspace,
} from './utils';
import './static/xterm.css';
import { NamespacePickerDialog } from '../NamespacePickerDialog';

const useStyles = makeStyles({
  term: {
    width: '100%',
    height: '400px',
  },
  formDisplay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    rowGap: '10px',
    margin: '10px',
  },
  centerInfo: {
    textAlign: 'center',
    marginTop: '10px',
    marginBottom: '10px',
  },
});

export const TerminalComponent = () => {
  const config = useApi(configApiRef);
  const defaultNamespace = getDefaultNamespace(config);

  const [websocketRunning, setWebsocketRunning] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [displayModal, setDisplayModal] = React.useState(false);
  const [token, setToken] = React.useState<string | undefined>(undefined);
  const [namespace, setNamespace] = React.useState<string | undefined>(
    defaultNamespace,
  );

  const { entity } = useEntity();
  const cluster = entity.metadata.annotations?.[
    'kubernetes.io/api-server'
  ]?.replace(/(https?:\/\/)/, '');
  const classes = useStyles();
  const tokenRef = React.useRef<HTMLInputElement>(null);
  const termRef = React.useRef(null);
  const webSocketUrl = config.getString('webTerminal.webSocketUrl');
  const restServerUrl = config.getString('webTerminal.restServerUrl');
  /**
   * Terminal is attached to created websocket, attachment allows user
   * to interact with terminal as they would with a normal terminal
   */
  const setupTerminal = useCallback(() => {
    const terminal = new Terminal();
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    if (termRef.current) {
      terminal.open(termRef.current);
    }
    fitAddon.fit();
    return terminal;
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setToken(tokenRef.current?.value);
  };

  const handleSubmitModal = (selectedNamespace: string) => {
    setNamespace(selectedNamespace);
    setDisplayModal(false);
  };

  const handleClose = () => {
    setToken(undefined);
    setDisplayModal(false);
  };

  const setupPod = async (
    link: string,
    usedToken: string,
    usedNamespace: string,
  ) => {
    let terminalID;
    try {
      terminalID = await createWorkspace(
        restServerUrl,
        link,
        usedToken,
        usedNamespace,
      );
    } catch (error) {
      return undefined;
    }
    let workspaceID;
    let phase;
    while (phase !== 'Running') {
      [workspaceID, phase] = await getWorkspace(
        restServerUrl,
        link,
        usedToken,
        terminalID,
        usedNamespace,
      );
    }
    return { workspaceID, terminalID };
  };

  const setupPodRef = useRef(setupPod);

  React.useEffect(() => {
    if (!token || !cluster) {
      return;
    }
    const setupPodCurrent = setupPodRef.current;
    setLoading(true);
    setupPodCurrent(cluster, token, namespace!).then(names => {
      if (!names) {
        setDisplayModal(true);
        setLoading(false);
        return;
      }
      setLoading(false);
      setWebsocketRunning(true);
      const terminal = setupTerminal();
      terminal.writeln('Starting terminal, please wait...');
      const ws = new WebSocket(webSocketUrl, [
        'terminal.k8s.io',
        `base64url.bearer.authorization.k8s.io.${encodeURIComponent(token)}`,
        `base64url.console.link.k8s.io.${encodeURIComponent(cluster)}`,
        `base64url.workspace.id.k8s.io.${encodeURIComponent(
          names.workspaceID,
        )}`,
        `base64url.namespace.k8s.io.${encodeURIComponent(namespace!)}`,
        `base64url.terminal.id.k8s.io.${encodeURIComponent(names.terminalID)}`,
        `base64url.terminal.size.k8s.io.${encodeURIComponent(
          `${terminal.cols}x${terminal.rows}`,
        )}`,
      ]);
      ws.onopen = () => {
        terminal.clear();
        terminal.loadAddon(new AttachAddon(ws));
      };
      ws.onclose = () => {};
    });
  }, [token, namespace, setupTerminal, webSocketUrl, cluster]);

  if (loading) {
    return <Progress />;
  }

  if (websocketRunning) {
    return (
      <div data-testid="terminal" className={classes.term} ref={termRef} />
    );
  }

  return (
    <div>
      <InfoCard title="Web Terminal" noPadding>
        <form onSubmit={handleSubmit} className={classes.formDisplay}>
          <TextField
            data-testid="token-input"
            label="Token"
            type="password"
            variant="outlined"
            inputRef={tokenRef}
            required
          />
          <Button
            data-testid="submit-token-button"
            type="submit"
            color="primary"
            variant="contained"
          >
            Submit
          </Button>
        </form>
        {displayModal && (
          <NamespacePickerDialog
            onInit={() => getNamespaces(restServerUrl, cluster!, token!)}
            previousNamespace={namespace!}
            open={displayModal}
            handleClose={handleClose}
            onSubmit={handleSubmitModal}
          />
        )}
      </InfoCard>
    </div>
  );
};
