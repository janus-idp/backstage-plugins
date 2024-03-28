import React from 'react';

import { makeStyles } from '@material-ui/core';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

const useDrawerStyles = makeStyles(() => ({
  paper: {
    width: '40%',
    gap: '3%',
  },
}));

const useDrawerContentStyles = makeStyles(theme => ({
  sidebar: {
    display: 'flex',
    flexFlow: 'column',
    height: '100%',
    justifyContent: 'space-between',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottom: `2px solid ${theme.palette.border}`,
    padding: theme.spacing(2.5),
  },
  body: {
    padding: theme.spacing(2.5),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    flexGrow: 1,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '15px',
    alignItems: 'baseline',
    borderTop: `2px solid ${theme.palette.border}`,
    padding: theme.spacing(2.5),
  },
}));

type ConditionalAccessSidebarProps = {
  open: boolean;
  onClose: () => void;
  selPlugin: string;
  rules?: any;
  error?: Error;
};

export const ConditionalAccessSidebar = ({
  open,
  onClose,
  selPlugin,
  rules,
  error,
}: ConditionalAccessSidebarProps) => {
  const classes = useDrawerStyles();
  const contentClasses = useDrawerContentStyles();
  return (
    <Drawer
      anchor="right"
      open={open}
      data-testid="rules-sidebar"
      classes={{
        paper: classes.paper,
      }}
    >
      <Box className={contentClasses.sidebar}>
        <Box className={contentClasses.header}>
          <Typography variant="h5">
            <span style={{ fontWeight: '500' }}>
              Conditional access for the
            </span>{' '}
            {selPlugin} plugin
          </Typography>
          <IconButton
            key="dismiss"
            title="Close the drawer"
            onClick={onClose}
            color="inherit"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box className={contentClasses.body}>
          {rules ? (
            <>
              <Typography variant="body2">Rules</Typography>
              <ul>
                {rules.map((rule: any) => (
                  <li key={rule.name}>{rule.name}</li>
                ))}
              </ul>
            </>
          ) : (
            <Typography variant="body2">
              {error ? error.message : 'No rules found'}
            </Typography>
          )}
        </Box>
        <Box className={contentClasses.footer}>
          <Button variant="contained" disabled>
            Save
          </Button>{' '}
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};
