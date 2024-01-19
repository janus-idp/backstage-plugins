import * as React from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  Typography,
} from '@material-ui/core';
import ExpandMoreRounded from '@material-ui/icons/ExpandMoreRounded';
import moment from 'moment';

import { MessageCenterActions } from '../../actions/MessageCenterActions';
import { KialiIcon } from '../../config/KialiIcon';
import { KialiAppState, KialiContext } from '../../store';
import { MessageType, NotificationMessage } from '../../types/MessageCenter';

const getIcon = (type: MessageType) => {
  switch (type) {
    case MessageType.ERROR:
      return <KialiIcon.Error />;
    case MessageType.INFO:
      return <KialiIcon.Info />;
    case MessageType.SUCCESS:
      return <KialiIcon.Ok />;
    case MessageType.WARNING:
      return <KialiIcon.Warning />;
    default:
      throw Error('Unexpected type');
  }
};

type AlertDrawerMessageProps = {
  message: NotificationMessage;
};

export const AlertDrawerMessage = (props: AlertDrawerMessageProps) => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;

  // const markAsRead = (message: NotificationMessage) => kialiState.dispatch.messageDispatch(MessageCenterActions.markAsRead(message.id));
  const toggleMessageDetail = (message: NotificationMessage) =>
    kialiState.dispatch.messageDispatch(
      MessageCenterActions.toggleMessageDetail(message.id),
    );

  return (
    <Card>
      <CardContent>
        {getIcon(props.message.type)}{' '}
        {props.message.seen ? (
          props.message.content
        ) : (
          <b>{props.message.content}</b>
        )}
        {props.message.detail && (
          <Accordion elevation={0}>
            <AccordionSummary
              style={{ flexDirection: 'row-reverse' }}
              onClick={() => toggleMessageDetail(props.message)}
              expandIcon={<ExpandMoreRounded />}
            >
              <Typography>
                {props.message.showDetail ? 'Hide Detail' : 'Show Detail'}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {props.message.detail}
              </pre>
            </AccordionDetails>
          </Accordion>
        )}
        {props.message.count > 1 && (
          <div>
            {props.message.count} {moment().from(props.message.firstTriggered)}
          </div>
        )}
        <div>
          <span style={{ float: 'left' }}>
            {props.message.created.toLocaleDateString()}
          </span>
          <span style={{ float: 'right' }}>
            {props.message.created.toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
