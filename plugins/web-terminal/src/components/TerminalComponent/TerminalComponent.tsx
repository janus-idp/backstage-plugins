import { makeStyles } from '@material-ui/core';
import React from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import './static/xterm.css';

const useTerminalStyles = makeStyles({
  term: {
    width: '100%',
    height: '100%',
  },
});
export const TerminalComponent = () => {
  const fitAddon = new FitAddon();
  const terminal = new Terminal();
  terminal.loadAddon(fitAddon);
  fitAddon.fit();
  const classes = useTerminalStyles();
  React.useEffect(() => {
    const terminalElement = document.getElementById('terminal');
    if (terminalElement) {
      terminal.open(terminalElement);
      terminal.write('$ ');
    }
  });
  return <div className={classes.term} id="terminal" />;
};
