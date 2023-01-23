import { Button, makeStyles, TextField } from '@material-ui/core';
import React, { useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from 'xterm-addon-attach';
import { InfoCard, Progress } from '@backstage/core-components';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { createWorkspace, getWorkspace } from './utils';
import './static/xterm.css';

const useTerminalStyles = makeStyles({
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

interface IFormData {
  token: string | undefined;
  cluster: string | undefined;
}

export const TerminalComponent = () => {
  const [websocketRunning, setWebsocketRunning] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<IFormData>({
    token: undefined,
    cluster: undefined,
  });
  const classes = useTerminalStyles();
  const tokenRef = React.useRef<HTMLInputElement>(null);
  const clusterRef = React.useRef<HTMLInputElement>(null);
  const termRef = React.useRef(null);
  const config = useApi(configApiRef);
  const webSocketUrl = config.getString('webTerminal.webSocketUrl');
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
    setFormData({
      token: tokenRef.current?.value,
      cluster: clusterRef.current?.value,
    });
  };

  const setupPod = async (link: string, token: string) => {
    const terminalID = await createWorkspace(link, token);
    let workspaceID;
    let phase;
    while (phase !== 'Running') {
      [workspaceID, phase] = await getWorkspace(link, token, terminalID);
    }
    return { workspaceID, terminalID };
  };

  React.useEffect(() => {
    if (!formData.token || !formData.cluster) {
      return;
    }
    const { token, cluster } = formData;
    setLoading(true);
    setupPod(cluster, token).then(names => {
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
  }, [formData, setupTerminal, webSocketUrl]);

  if (loading) {
    return <Progress />;
  }

  if (websocketRunning) {
    return <div className={classes.term} ref={termRef} />;
  }

  return (
    <div>
      <InfoCard title="Web Terminal" noPadding>
        <form onSubmit={handleSubmit} className={classes.formDisplay}>
          <TextField label="Cluster" variant="outlined" inputRef={clusterRef} />
          <TextField
            label="Token"
            type="password"
            variant="outlined"
            inputRef={tokenRef}
          />
          <Button type="submit" color="primary" variant="contained">
            Submit
          </Button>
        </form>
      </InfoCard>
    </div>
  );
};
