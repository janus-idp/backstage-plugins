import React from 'react';

import Button from '@material-ui/core/Button';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import SendIcon from '@material-ui/icons/Send';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapForm: {
      display: 'flex',
      justifyContent: 'center',
      width: '98%',
      margin: `${theme.spacing(0)} auto`,
    },
    wrapText: {
      width: '100%',
    },
    button: {
      margin: theme.spacing(0),
    },
  }),
);

type LightspeedInputProps = {
  onSubmit: (prompt: string) => void;
};

export const LightspeedInput: React.FC<LightspeedInputProps> = ({
  onSubmit,
}) => {
  const classes = useStyles();

  const [prompt, setPrompt] = React.useState('');

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPrompt(e.target.value);
    },
    [],
  );

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(prompt);
      setPrompt('');
    },
    [onSubmit, prompt],
  );

  return (
    <form
      className={classes.wrapForm}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <TextField
        id="standard-text"
        label="Ask Lightspeed"
        className={classes.wrapText}
        value={prompt}
        onChange={handleInputChange}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        className={classes.button}
        onSubmit={handleSubmit}
      >
        <SendIcon />
      </Button>
    </form>
  );
};
