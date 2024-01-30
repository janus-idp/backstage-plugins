import React from 'react';

import { ContentHeader, Select } from '@backstage/core-components';

import { Button, Chip, Grid, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { ClusterIcon } from '@patternfly/react-icons';
import { QuestionCircleIcon } from '@patternfly/react-icons/';

import { NamespaceActions } from '../../../actions';
import { AboutUIModal } from '../../../components/About/AboutUIModal';
import { DebugInformation } from '../../../components/DebugInformation/DebugInformation';
import { MessageCenter } from '../../../components/MessageCenter/MessageCenter';
import { homeCluster } from '../../../config';
import { KialiAppState, KialiContext } from '../../../store';

export const KialiHeader = (props: { title: string }) => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showAbout, setShowAbout] = React.useState<boolean>(false);
  const [showDebug, setShowDebug] = React.useState<boolean>(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setShowAbout(false);
    setAnchorEl(null);
  };

  const openAbout = () => {
    setShowAbout(true);
    setAnchorEl(null);
  };

  const openDebugInformation = () => {
    // Using wrapped component, so we have to get the wrappedInstance
    setShowDebug(true);
    setAnchorEl(null);
  };

  const title = props.title.charAt(0).toUpperCase() + props.title.slice(1);
  return (
    <>
      <Select
        label="Namespaces Selected"
        placeholder="Select namespaces"
        items={(kialiState.namespaces.items || []).map(ns => ({
          label: ns.name,
          value: ns.name,
        }))}
        selected={kialiState.namespaces.activeNamespaces.map(ns => ns.name)}
        multiple
        onChange={values => {
          kialiState.dispatch.namespaceDispatch(
            NamespaceActions.setActiveNamespaces(
              kialiState.namespaces.items!.filter(ns =>
                (values as string[]).includes(ns.name),
              ),
            ),
          );
        }}
      />

      <ContentHeader title={title}>
        <Grid container spacing={1}>
          {homeCluster && (
            <Grid item>
              <Tooltip
                title={<div>Kiali home cluster: {homeCluster?.name}</div>}
              >
                <Chip
                  color="primary"
                  icon={<ClusterIcon />}
                  label={homeCluster?.name}
                />
              </Tooltip>
            </Grid>
          )}
          <Grid item>
            <Button onClick={handleClick}>
              <QuestionCircleIcon />
            </Button>
          </Grid>
          <Grid item>
            <MessageCenter />
          </Grid>
          <Grid item>
            <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
              <MenuItem onClick={openDebugInformation}>
                View Debug Info
              </MenuItem>
              <MenuItem onClick={openAbout}>About</MenuItem>
            </Menu>
          </Grid>
          <Grid item>
            {kialiState.authentication.session && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ margin: '10px' }}>
                  <b>User : </b>
                  {kialiState.authentication.session.username || 'anonymous'}
                </span>
              </div>
            )}
          </Grid>
        </Grid>
      </ContentHeader>
      <AboutUIModal
        showModal={showAbout}
        setShowModal={setShowAbout}
        status={kialiState.statusState.status}
        externalServices={kialiState.statusState.externalServices}
        warningMessages={kialiState.statusState.warningMessages}
      />
      <DebugInformation
        appState={kialiState}
        showDebug={showDebug}
        setShowDebug={setShowDebug}
      />
    </>
  );
};
