import React from 'react';

import { Box, makeStyles } from '@material-ui/core';
import { AutocompleteRenderOptionState } from '@material-ui/lab/Autocomplete';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';

import { SelectedMember } from './types';

type MembersDropdownOptionProps = {
  option: SelectedMember;
  state: AutocompleteRenderOptionState;
};

const useStyles = makeStyles(theme => ({
  optionLabel: {
    color: theme.palette.text.primary,
  },
  optionDescription: {
    color: theme.palette.text.secondary,
  },
}));

export const MembersDropdownOption = ({
  option,
  state,
}: MembersDropdownOptionProps) => {
  const classes = useStyles();
  const { inputValue } = state;
  const { label, etag } = option;
  const matches = match(label, inputValue, { insideWords: true });
  const parts = parse(label, matches);

  return (
    <Box key={`${etag}`}>
      {parts.map(part => (
        <span
          key={`${part.text}-${etag}`}
          className={classes.optionLabel}
          style={{
            fontWeight: part.highlight ? 400 : 700,
          }}
        >
          {part.text}
        </span>
      ))}
      <br />
      <span className={classes.optionDescription}>{option.description}</span>
    </Box>
  );
};
