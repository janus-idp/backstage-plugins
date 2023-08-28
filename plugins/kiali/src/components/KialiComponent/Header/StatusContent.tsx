import React from 'react';

import {
  StatusAborted,
  StatusError,
  StatusOK,
  StatusRunning,
  StatusWarning,
} from '@backstage/core-components';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import Close from '@material-ui/icons/Close';

import {
  KialiConfigT,
  KialiInfo,
} from '@janus-idp/backstage-plugin-kiali-common';

const statusIcon: { [key: string]: JSX.Element } = {
  running: <StatusOK>Running</StatusOK>,
  pending: <StatusRunning>Pending</StatusRunning>,
  failed: <StatusError>Failed</StatusError>,
  succeeded: <StatusOK>Succeeded</StatusOK>,
  unkown: <StatusAborted>Unkown</StatusAborted>,
  default: <StatusAborted>Default</StatusAborted>,
  warning: <StatusWarning>Warning</StatusWarning>,
};

const getStatusIcon = (status?: string) => {
  const st = status || 'unknown';
  return statusIcon[st];
};

export const StatusContent = (props: {
  kialiStatus: KialiInfo;
  config: KialiConfigT;
  toggleDrawer: (isOpen: boolean) => void;
}) => {
  const [expanded, setExpanded] = React.useState<string | false>('kiali_info');

  const handleChange = (panel: string) => (_: any, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getRows = () => {
    const conf: string[][] = [];

    for (const [k, v] of Object.entries(props.config.server)) {
      if (typeof v !== 'string') {
        conf.push([k, JSON.stringify(v)]);
      } else {
        conf.push([k, v]);
      }
    }
    return conf;
  };
  const MeshVersion = `${props.kialiStatus.status.status['Mesh name']} ${props.kialiStatus.status.status['Mesh version']}`;
  const kialiContainer = `${props.kialiStatus.status.status['Kiali container version']}`;
  const kialiVersion = `${props.kialiStatus.status.status['Kiali version']} (${props.kialiStatus.status.status['Kiali commit hash']})`;

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Grid container>
          <Grid xs={2}>
            <img
              alt="Kiali logo"
              src="https://raw.githubusercontent.com/janus-idp/janus-idp.github.io/main/apps/website/static/images/plugins/kiali.svg"
            />
          </Grid>
          <Grid style={{ alignSelf: 'end' }}>
            <Typography variant="h1">Kiali Info</Typography>
          </Grid>
        </Grid>

        <IconButton
          key="dismiss"
          title="Close the drawer"
          onClick={() => props.toggleDrawer(false)}
          color="inherit"
        >
          <Close style={{ fontSize: '20' }} />
        </IconButton>
      </div>
      <div style={{ height: '80%' }}>
        <Accordion
          expanded={expanded === 'kiali_info'}
          onChange={handleChange('kiali_info')}
        >
          <AccordionSummary>
            <Typography>Kiali Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table component={Paper} aria-label="components table">
                <TableBody>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>
                      Strategy
                    </TableCell>
                    <TableCell>{props.kialiStatus.auth.strategy}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>
                      Kiali status
                    </TableCell>
                    <TableCell align="left">
                      {getStatusIcon(
                        props.kialiStatus.status.status['Kiali state'],
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>Kiali</TableCell>
                    <TableCell>{kialiVersion}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>
                      Kiali Container
                    </TableCell>
                    <TableCell>{kialiContainer}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ fontWeight: 'bold' }}>
                      Service Mesh
                    </TableCell>
                    <TableCell>{MeshVersion}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'kiali_components'}
          onChange={handleChange('kiali_components')}
        >
          <AccordionSummary>
            <Typography>Components</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table component={Paper} aria-label="components table">
                <TableBody>
                  {props.kialiStatus.status.externalServices.map(comp => (
                    <TableRow key={`component_${comp.name}`}>
                      <TableCell style={{ fontWeight: 'bold' }}>
                        {comp.name}
                      </TableCell>
                      <TableCell>{comp.version || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'kiali_config'}
          onChange={handleChange('kiali_config')}
        >
          <AccordionSummary>
            <Typography>Configuration</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ width: '30%' }}>
                      Configuration
                    </TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getRows().map(row => (
                    <TableRow key={`config_${row[0]}`}>
                      <TableCell>{row[0]}</TableCell>
                      <TableCell>{row[1]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </div>
    </>
  );
};
