import React from 'react';

import { Box } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

export const AddNestedConditionButton = () => {
  const tooltipTitle = () => (
    <div>
      <p style={{ textAlign: 'center' }}>
        Nested conditions are <b>1 layer rules within a main condition</b>. It
        lets you allow appropriate access by using detailed permissions based on
        various conditions. You can add multiple nested conditions.
      </p>
      <p style={{ textAlign: 'center' }}>
        For example, you can allow access to all entity types in the main
        condition and use a nested condition to limit the access to entities
        owned by the user.
      </p>
    </div>
  );
  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <span>Add Nested Condition</span>
      <Tooltip title={tooltipTitle()} placement="top">
        <HelpOutlineIcon fontSize="inherit" style={{ marginLeft: '0.25rem' }} />
      </Tooltip>
    </Box>
  );
};
