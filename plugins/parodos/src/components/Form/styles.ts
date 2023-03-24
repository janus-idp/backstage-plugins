import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme => ({
  stepLabel: {
    '& span': {
      fontSize: '1.25rem',
    },
  },
  previous: {
    border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.text.primary,
    marginRight: theme.spacing(1),
    textTransform: 'uppercase',
    '&:disabled': {
      border: `1px solid ${theme.palette.text.disabled}`,
    },
  },
  next: {
    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  buttonContainer: {
    marginBottom: theme.spacing(2),
  },
  formWrapper: {
    padding: theme.spacing(2),
  },
  stepper: {
    margin: 0,
    paddingLeft: theme.spacing(1),
  },
}));
