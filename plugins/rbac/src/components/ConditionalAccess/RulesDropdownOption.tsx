import React from 'react';

import { makeStyles } from '@material-ui/core';
import Box from '@mui/material/Box';

import { RulesData } from './types';

const useStyles = makeStyles(theme => ({
  optionLabel: {
    color: theme.palette.text.primary,
  },
  optionDescription: {
    color: theme.palette.text.secondary,
    fontSize: '14px',
  },
}));

type RulesDropdownOptionProps = {
  label: string;
  rulesData?: RulesData;
};

export const RulesDropdownOption = ({
  label,
  rulesData,
}: RulesDropdownOptionProps) => {
  const classes = useStyles();
  const description = rulesData?.[label]?.description ?? '';
  return (
    <Box style={{ display: 'flex', flexFlow: 'column' }}>
      <span className={classes.optionLabel}>{label}</span>
      <span className={classes.optionDescription}>{description}</span>
    </Box>
  );
};
