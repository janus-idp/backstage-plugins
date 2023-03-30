import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  ButtonGroup,
  Chip,
  Grid,
  TablePagination,
  Typography,
  withStyles,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { Progress, Select, SelectedItems } from '@backstage/core-components';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { NotificationOperation, NotificationState } from '../../stores/types';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { getHumanReadableDate } from '../converters';
import { NotificationContent } from '../../models/notification';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';

const ParodosAccordion = withStyles({
  root: {
    border: '1px solid',
    borderLeftWidth: '0',
    borderRightWidth: '0',
    borderColor: grey.A100,
    background: 'transparent',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 1,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(Accordion);

const isNotificationArchived = (notification: NotificationContent) =>
  notification.folder === 'archive';
const isNotificationRead = (notification: NotificationContent) =>
  notification.read;

export const NotificationList: React.FC = () => {
  const notifications = useStore(state => state.notifications);
  const fetchNotifications = useStore(state => state.fetchNotifications);
  const deleteNotification = useStore(state => state.deleteNotification);
  const setNotificationState = useStore(state => state.setNotificationState);
  const notificationsCount = useStore(state => state.notificationsCount);
  const loading = useStore(state => state.notificationsLoading);

  const [notificationFilter, setNotificationFilter] =
    useState<NotificationState>('ALL');

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const errorApi = useApi(errorApiRef);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchNotifications({ state: notificationFilter, page, rowsPerPage });
  }, [notificationFilter, page, rowsPerPage, fetchNotifications]);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onFilterNotifications = (arg: SelectedItems) => {
    setNotificationFilter(arg as NotificationState);
    setPage(0);
  };

  const getOnDelete =
    (
      notification: NotificationContent,
    ): React.MouseEventHandler<HTMLButtonElement> =>
    e => {
      e.stopPropagation();
      const doItAsync = async () => {
        try {
          await deleteNotification(notification);
          await fetchNotifications({
            state: notificationFilter,
            page,
            rowsPerPage,
          });
        } catch (e) {
          errorApi.post(
            new Error(
              `Failed to delete notification: ${JSON.stringify(notification)}`,
            ),
          );
        }
      };
      doItAsync();
    };

  const getSetNotificationState =
    (
      notification: NotificationContent,
      newState: NotificationOperation,
    ): React.MouseEventHandler<HTMLButtonElement> =>
    e => {
      e.stopPropagation();
      const doItAsync = async () => {
        try {
          await setNotificationState({ id: notification.id, newState });
          await fetchNotifications({
            state: notificationFilter,
            page,
            rowsPerPage,
          });
        } catch (e) {
          errorApi.post(
            new Error(
              `Failed to set notification to "${newState}": ${JSON.stringify(
                notification,
              )}`,
            ),
          );
        }
      };
      doItAsync();
    };

  return (
    <>
      <Grid container direction="column" spacing={2}>
        <Grid item xs={3}>
          <Select
            onChange={onFilterNotifications}
            selected={notificationFilter}
            label="Filter by"
            items={[
              { label: 'All', value: 'ALL' },
              { label: 'Unread', value: 'UNREAD' },
              { label: 'Archived', value: 'ARCHIVED' },
            ]}
          />
        </Grid>
        <Grid item>
          {loading && <Progress />}

          {(notifications || []).map(notification => (
            <ParodosAccordion square key={notification.id}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id={`panel1bh-header-${notification.id}`}
              >
                <Grid container direction="row" alignItems="center" spacing={2}>
                  <Grid item xs={5}>
                    <Typography variant="body2">
                      {notification.subject}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2">
                      {getHumanReadableDate(notification.createdOn)}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    {(notification.tags || []).map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Grid>
                  <Grid item xs={3}>
                    <ButtonGroup>
                      <Button
                        variant="outlined"
                        onClick={getOnDelete(notification)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outlined"
                        disabled={isNotificationArchived(notification)}
                        onClick={getSetNotificationState(
                          notification,
                          'ARCHIVE',
                        )}
                      >
                        Archive
                      </Button>
                      <Button
                        variant="outlined"
                        disabled={isNotificationRead(notification)}
                        onClick={getSetNotificationState(notification, 'READ')}
                      >
                        Read
                      </Button>
                    </ButtonGroup>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  spacing={2}
                >
                  <Grid item xs={6}>
                    {notification.body}
                  </Grid>
                  <Grid item xs={2}>
                    {notification.fromuser}
                  </Grid>
                  <Grid item xs={2}>
                    {notification.messageType}
                  </Grid>
                  <Grid item xs={2}>
                    {notification.folder}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </ParodosAccordion>
          ))}
        </Grid>
        <Grid container direction="row" justifyContent="center">
          <TablePagination
            component="div"
            count={notificationsCount || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 20]}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Grid>
      </Grid>
    </>
  );
};
