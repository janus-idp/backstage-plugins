import React from 'react';

import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
  createStyles({
    messageRow: {
      display: 'flex',
    },
    messageRowRight: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    messageBlue: {
      position: 'relative',
      marginLeft: '20px',
      marginBottom: '10px',
      padding: '10px',
      backgroundColor: '#476373',
      width: '60%',
      textAlign: 'left',
      border: '1px solid #97C6E3',
      borderRadius: '10px',
      '&:after': {
        content: "''",
        position: 'absolute',
        width: '0',
        height: '0',
        borderTop: '15px solid #476373',
        borderLeft: '15px solid transparent',
        borderRight: '15px solid transparent',
        top: '0',
        left: '-15px',
      },
      '&:before': {
        content: "''",
        position: 'absolute',
        width: '0',
        height: '0',
        borderTop: '17px solid #97C6E3',
        borderLeft: '16px solid transparent',
        borderRight: '16px solid transparent',
        top: '-1px',
        left: '-17px',
      },
    },
    messageOrange: {
      position: 'relative',
      marginRight: '20px',
      marginBottom: '15px',
      padding: '15px',
      backgroundColor: '#665f3b',
      width: '60%',
      textAlign: 'left',
      border: '1px solid #dfd087',
      borderRadius: '10px',
      '&:after': {
        content: "''",
        position: 'absolute',
        width: '0',
        height: '0',
        borderTop: '15px solid #665f3b',
        borderLeft: '15px solid transparent',
        borderRight: '15px solid transparent',
        top: '0',
        right: '-15px',
      },
      '&:before': {
        content: "''",
        position: 'absolute',
        width: '0',
        height: '0',
        borderTop: '17px solid #dfd087',
        borderLeft: '16px solid transparent',
        borderRight: '16px solid transparent',
        top: '-1px',
        right: '-17px',
      },
    },

    messageContent: {
      padding: 0,
      margin: 0,
    },
    messageTimeStampRight: {
      position: 'absolute',
      fontSize: '.85em',
      fontWeight: 'lighter',
      marginTop: '10px',
      bottom: '-3px',
      right: '5px',
      marginBottom: '5px',
    },
  }),
);

type SystemMessageProps = {
  message: string;
  timestamp?: string;
};

export const SystemMessage: React.FC<SystemMessageProps> = ({
  message,
  timestamp,
}) => {
  const classes = useStyles();
  return (
    <>
      <div className={classes.messageRow}>
        <div className={classes.messageBlue}>
          <p className={classes.messageContent}>{message}</p>
          {timestamp && (
            <div className={classes.messageTimeStampRight}>{timestamp}</div>
          )}
        </div>
      </div>
    </>
  );
};

type UserMessageProps = {
  message: string;
  timestamp?: string;
};

export const UserMessage: React.FC<UserMessageProps> = ({
  message,
  timestamp,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.messageRowRight}>
      <div className={classes.messageOrange}>
        <p className={classes.messageContent}>{message}</p>
        {timestamp && (
          <div className={classes.messageTimeStampRight}>{timestamp}</div>
        )}
      </div>
    </div>
  );
};
