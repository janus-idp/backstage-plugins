import { Button, makeStyles, TextField } from '@material-ui/core';
import React, { useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { AttachAddon } from 'xterm-addon-attach';
import { InfoCard, Progress } from '@backstage/core-components';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

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
  const setupTerminal = useCallback((ws: WebSocket) => {
    const terminal = new Terminal();
    terminal.loadAddon(new AttachAddon(ws));
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    fitAddon.fit();
    if (termRef.current) {
      terminal.open(termRef.current);
    }
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormData({
      token: tokenRef.current?.value,
      cluster: clusterRef.current?.value,
    });
  };

  React.useEffect(() => {
    if (!formData.token || !formData.cluster) {
      return;
    }
    setLoading(true);
    const ws = new WebSocket(webSocketUrl, [
      `base64url.bearer.authorization.k8s.io.${encodeURIComponent(
        formData.token,
      )}`,
      `base64url.console.link.k8s.io.${encodeURIComponent(formData.cluster)}`,
    ]);
    ws.onopen = () => {
      setLoading(false);
      setWebsocketRunning(true);
      setupTerminal(ws);
    };
    ws.onclose = () => {};
  }, [formData, setupTerminal]);

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
