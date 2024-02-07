import React from 'react';

import { Button, Menu, MenuItem } from '@material-ui/core';
import { QuestionCircleIcon } from '@patternfly/react-icons';

import { AboutUIModal } from '../../../components/About/AboutUIModal';
import { DebugInformation } from '../../../components/DebugInformation/DebugInformation';
import { KialiAppState, KialiContext } from '../../../store';

export const HelpKiali = (props: { color?: string }) => {
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

  return (
    <>
      <Button onClick={handleClick} style={{ marginTop: '5px' }}>
        <QuestionCircleIcon color={`${props.color}`} />
      </Button>
      <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
        <MenuItem onClick={openDebugInformation}>View Debug Info</MenuItem>
        <MenuItem onClick={openAbout}>About</MenuItem>
      </Menu>
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
