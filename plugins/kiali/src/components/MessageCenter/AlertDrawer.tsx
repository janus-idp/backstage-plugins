import * as React from 'react';

import { ItemCardHeader } from '@backstage/core-components';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from '@material-ui/core';
import ExpandMoreRounded from '@material-ui/icons/ExpandMoreRounded';
import { InfoIcon } from '@patternfly/react-icons';

import { KialiAppAction } from '../../actions/KialiAppAction';
import { MessageCenterState } from '../../store';
import { kialiStyle } from '../../styles/StyleUtils';
import {
  NotificationGroup,
  NotificationMessage,
} from '../../types/MessageCenter';
import { AlertDrawerGroup } from './AlertDrawerGroup';

type AlertDrawerProps = {
  toggleDrawer: (isOpen: boolean) => void;
  messages: MessageCenterState;
  messageDispatch: React.Dispatch<KialiAppAction>;
};

const hideGroup = (group: NotificationGroup): boolean => {
  return group.hideIfEmpty && group.messages.length === 0;
};

const getUnreadCount = (messages: NotificationMessage[]) => {
  return messages.reduce((count, message) => {
    return message.seen ? count : count + 1;
  }, 0);
};

const getUnreadMessageLabel = (messages: NotificationMessage[]) => {
  const unreadCount = getUnreadCount(messages);
  return unreadCount === 1
    ? '1 Unread Message'
    : `${getUnreadCount(messages)} Unread Messages`;
};

const drawer = kialiStyle({
  display: 'flex',
  width: '500px',
  justifyContent: 'space-between',
});

const noNotificationsMessage = (
  <>
    <InfoIcon />
    No Messages Available
  </>
);

export const AlertDrawer = (props: AlertDrawerProps) => {
  return (
    <Card className={drawer}>
      <CardMedia>
        <ItemCardHeader title="MessageCenter" subtitle="" />
      </CardMedia>
      <CardContent>
        {props.messages.groups.length === 0
          ? noNotificationsMessage
          : props.messages.groups.map(group =>
              hideGroup(group) ? null : (
                <Accordion elevation={0}>
                  <AccordionSummary
                    key={`${group.id}_item`}
                    expandIcon={<ExpandMoreRounded />}
                  >
                    <Typography>
                      {group.title} {getUnreadMessageLabel(group.messages)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <AlertDrawerGroup key={group.id} group={group} />
                  </AccordionDetails>
                </Accordion>
              ),
            )}
      </CardContent>
    </Card>
  );
};
