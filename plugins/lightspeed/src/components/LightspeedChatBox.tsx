import React from 'react';

import { makeStyles } from '@material-ui/core';
import {
  ChatbotWelcomePrompt,
  Message,
  MessageBox,
  MessageProps,
  WelcomePrompt,
} from '@patternfly/virtual-assistant';

const useStyles = makeStyles(theme => ({
  userMessageText: {
    '& div.pf-chatbot__message--user': {
      '& div.pf-chatbot__message-text': {
        '& p': {
          color: theme.palette.common.white,
        },
      },
    },
  },
}));

type LightspeedChatBoxProps = {
  userName?: string;
  messages: MessageProps[];
  profileLoading: boolean;
  announcement: string | undefined;
  welcomePrompts: WelcomePrompt[];
};

export const LightspeedChatBox = React.forwardRef(
  (
    {
      userName,
      messages,
      announcement,
      profileLoading,
      welcomePrompts,
    }: LightspeedChatBoxProps,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    const [cmessages, setCMessages] = React.useState(messages);
    const classes = useStyles();

    React.useEffect(() => {
      setCMessages(messages);
    }, [messages]);

    return (
      <MessageBox
        className={classes.userMessageText}
        announcement={announcement}
      >
        <ChatbotWelcomePrompt
          title={`Hello, ${profileLoading ? '...' : (userName ?? 'Guest')}`}
          description="How can I help you today?"
          prompts={welcomePrompts}
        />
        {cmessages.map((message, index) => {
          if (index === cmessages.length - 1) {
            return (
              <React.Fragment key={`${message.role}-${index}`}>
                <Message key={`${message.role}-${index}`} {...message} />
                <div ref={ref} />
              </React.Fragment>
            );
          }
          return <Message key={`${message.role}-${index}`} {...message} />;
        })}
      </MessageBox>
    );
  },
);
