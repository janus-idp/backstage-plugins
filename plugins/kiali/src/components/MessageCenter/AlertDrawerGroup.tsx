import * as React from 'react';

import { Button, Card, CardActions, CardContent } from '@material-ui/core';
import { InfoIcon } from '@patternfly/react-icons';

import { MessageCenterActions } from '../../actions';
import { KialiAppState, KialiContext } from '../../store';
import { NotificationGroup } from '../../types/MessageCenter';
import { AlertDrawerMessage } from './AlertDrawerMessage';

type AlertDrawerGroupProps = {
  group: NotificationGroup;
  reverseMessageOrder?: boolean;
};

const noNotificationsMessage = (
  <>
    <InfoIcon />
    No Messages Available
  </>
);

export const AlertDrawerGroup = (props: AlertDrawerGroupProps) => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;

  const markGroupAsRead = (groupId: string) => {
    const foundGroup = kialiState.messageCenter.groups.find(
      group => group.id === groupId,
    );
    if (foundGroup) {
      kialiState.dispatch.messageDispatch(
        MessageCenterActions.markAsRead(
          foundGroup.messages.map(message => message.id),
        ),
      );
    }
  };

  const clearGroup = (groupId: string) => {
    const foundGroup = kialiState.messageCenter.groups.find(
      group => group.id === groupId,
    );
    if (foundGroup) {
      kialiState.dispatch.messageDispatch(
        MessageCenterActions.removeMessage(
          foundGroup.messages.map(message => message.id),
        ),
      );
    }
  };

  const getMessages = () => {
    return props.reverseMessageOrder
      ? [...props.group.messages].reverse()
      : props.group.messages;
  };

  const group: NotificationGroup = props.group;

  return (
    <Card elevation={0}>
      <CardContent style={{ paddingTop: 0 }}>
        {group.messages.length === 0 && noNotificationsMessage}
        {getMessages().map(message => (
          <AlertDrawerMessage key={message.id} message={message} />
        ))}
      </CardContent>
      {group.showActions && group.messages.length > 0 && (
        <CardActions>
          <Button variant="text" onClick={() => markGroupAsRead(group.id)}>
            Mark All Read
          </Button>
          <Button variant="text" onClick={() => clearGroup(group.id)}>
            Clear All
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
