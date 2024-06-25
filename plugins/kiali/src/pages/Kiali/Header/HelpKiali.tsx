import React from 'react';

import { Button } from '@material-ui/core';
import { QuestionCircleIcon } from '@patternfly/react-icons';

import { AboutUIModal } from '../../../components/About/AboutUIModal';
import { KialiAppState, KialiContext } from '../../../store';

export const HelpKiali = (props: { color?: string }) => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [showAbout, setShowAbout] = React.useState<boolean>(false);

  const openAbout = () => {
    setShowAbout(true);
  };

  return (
    <>
      <Button
        onClick={openAbout}
        style={{ marginTop: '-5px' }}
        data-test="help-button"
      >
        <QuestionCircleIcon color={`${props.color}`} />
      </Button>
      <AboutUIModal
        showModal={showAbout}
        setShowModal={setShowAbout}
        status={kialiState.statusState.status}
        externalServices={kialiState.statusState.externalServices}
        warningMessages={kialiState.statusState.warningMessages}
      />
    </>
  );
};
