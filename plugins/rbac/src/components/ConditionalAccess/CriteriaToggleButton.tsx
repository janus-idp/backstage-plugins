import React, { CSSProperties } from 'react';

import { Theme } from '@material-ui/core';
import ToggleButton from '@mui/material/ToggleButton';

type CriteriaToggleButtonProps = {
  val: string;
  label: string;
  selectedCriteria: string;
  theme: Theme;
};

export const CriteriaToggleButton = ({
  val,
  label,
  selectedCriteria,
  theme,
}: CriteriaToggleButtonProps) => {
  const isSelected = val === selectedCriteria;
  const buttonStyle: CSSProperties = {
    color: isSelected ? theme.palette.infoText : theme.palette.textSubtle,
    backgroundColor: isSelected ? theme.palette.infoBackground : '',
    border: `1px solid ${theme.palette.border}`,
    width: '100%',
    textTransform: 'none',
    padding: theme.spacing(1),
  };

  return (
    <ToggleButton
      key={val}
      value={val}
      style={buttonStyle}
      size="large"
      disabled={isSelected}
    >
      {label}
    </ToggleButton>
  );
};
