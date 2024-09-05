import React from 'react';

import { Icon } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

import './RedExclamationCircleIcon.css';

const RedExclamationCircleIcon = () => {
  return (
    <Icon>
      <ExclamationCircleIcon className="red-exclamation-icon" />
    </Icon>
  );
};
export default RedExclamationCircleIcon;
