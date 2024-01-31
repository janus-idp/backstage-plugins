import * as React from 'react';

import { Badge, Button, Drawer } from '@material-ui/core';

import { KialiIcon } from '../../config/KialiIcon';
import { KialiAppState, KialiContext } from '../../store';
import { kialiStyle } from '../../styles/StyleUtils';
import {
  MessageType,
  NotificationGroup,
  NotificationMessage,
} from '../../types/MessageCenter';
import { AlertDrawer } from './AlertDrawer';

const bell = kialiStyle({
  position: 'relative',
  right: '5px',
  top: '5px',
});

const calculateMessageStatus = (state: KialiAppState) => {
  type MessageCenterTriggerPropsToMap = {
    newMessagesCount: number;
    badgeDanger: boolean;
    systemErrorsCount: number;
  };

  const dangerousMessageTypes = [MessageType.ERROR, MessageType.WARNING];
  let systemErrorsCount = 0;

  const systemErrorsGroup = state.messageCenter.groups.find(
    item => item.id === 'systemErrors',
  );
  if (systemErrorsGroup) {
    systemErrorsCount = systemErrorsGroup.messages.length;
  }

  return state.messageCenter.groups
    .reduce(
      (unreadMessages: NotificationMessage[], group: NotificationGroup) => {
        return unreadMessages.concat(
          group.messages.reduce(
            (
              unreadMessagesInGroup: NotificationMessage[],
              message: NotificationMessage,
            ) => {
              if (!message.seen) {
                unreadMessagesInGroup.push(message);
              }
              return unreadMessagesInGroup;
            },
            [],
          ),
        );
      },
      [],
    )
    .reduce(
      (
        propsToMap: MessageCenterTriggerPropsToMap,
        message: NotificationMessage,
      ) => {
        propsToMap.newMessagesCount++;
        propsToMap.badgeDanger =
          propsToMap.badgeDanger ||
          dangerousMessageTypes.includes(message.type);
        return propsToMap;
      },
      {
        newMessagesCount: 0,
        systemErrorsCount: systemErrorsCount,
        badgeDanger: false,
      },
    );
};

export const MessageCenter = () => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;
  const [isOpen, toggleDrawer] = React.useState(false);
  const messageCenterStatus = calculateMessageStatus(kialiState);
  /*
  const onDismiss = (message: NotificationMessage, userDismissed: boolean) => {
    if (userDismissed) {
      kialiState.messageDispatch(MessageCenterActions.markAsRead(message.id));
    } else {
      kialiState.messageDispatch(MessageCenterActions.hideNotification(message.id));
    }  
  }
  */
  return (
    <>
      <Button onClick={() => toggleDrawer(true)}>
        <Badge
          overlap="circular"
          badgeContent={
            messageCenterStatus.newMessagesCount > 0
              ? messageCenterStatus.newMessagesCount
              : undefined
          }
          color={messageCenterStatus.badgeDanger ? 'error' : 'primary'}
        >
          <KialiIcon.Bell className={bell} />
        </Badge>
      </Button>
      <Drawer anchor="right" open={isOpen} onClose={() => toggleDrawer(false)}>
        <AlertDrawer
          toggleDrawer={toggleDrawer}
          messages={kialiState.messageCenter}
          messageDispatch={kialiState.dispatch.messageDispatch}
        />
      </Drawer>
    </>
  );
};
