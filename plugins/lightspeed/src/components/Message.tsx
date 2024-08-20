import React from 'react';
import Markdown from 'react-markdown';

import { createStyles, makeStyles } from '@material-ui/core/styles';
import { CodeBlock, CodeBlockCode } from '@patternfly/react-core';

const useStyles = makeStyles(theme =>
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
      width: '60%',
      textAlign: 'left',
    },
    messageOrange: {
      position: 'relative',
      marginRight: '20px',
      marginBottom: '15px',
      padding: '15px',
      backgroundColor: theme.palette.background.default,
      width: '60%',
      textAlign: 'left',
      border: `1px solid ${theme.palette.grey[400]}`,
      borderRadius: '10px',
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

const useCodeStyles = makeStyles(theme => ({
  codeBlock: { backgroundColor: theme.palette.grey[900] },
  codeBlockCode: {
    maxHeight: '20rem',
    overflow: 'auto',
    whiteSpace: 'pre',
    color: '#ffffff',
    padding: theme.spacing(2),
  },
}));

const Code = ({ children }: { children?: React.ReactNode }) => {
  const classes = useCodeStyles();

  if (!String(children).includes('\n')) {
    return <code>{children}</code>;
  }

  return (
    <CodeBlock className={classes.codeBlock}>
      <CodeBlockCode className={classes.codeBlockCode}>
        {children}
      </CodeBlockCode>
    </CodeBlock>
  );
};

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
          <Markdown components={{ code: Code }}>{message}</Markdown>
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
