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

import { NotificationState } from '../../stores/types';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { getHumanReadableDate } from '../converters';
import { NotificationContent } from '../../models/notification';

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

export const NotificationList: React.FC = () => {
  const notifications = useStore(state => state.notifications);
  const fetchNotifications = useStore(state => state.fetchNotifications);
  const loading = useStore(state => state.notificationsLoading);

  console.log('--- NotificationList, notifications: ', notifications);
  const [notificationFilter, setNotificationFilter] =
    useState<NotificationState>('ALL');

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const onFilterNotifications = (arg: SelectedItems) => {
    console.log('--- onFileterNotifications arg: ', arg);
    setNotificationFilter(arg as NotificationState);
  };

  useEffect(() => {
    fetchNotifications({ state: notificationFilter, page, rowsPerPage });
  }, [notificationFilter, page, rowsPerPage]);

  const getOnDelete =
    (
      notification: NotificationContent,
    ): React.MouseEventHandler<HTMLButtonElement> =>
    e => {
      e.stopPropagation();
      console.log('--- TODO: implement onDelete, notification: ', notification);
    };

  return (
    <>
      <Grid container direction="column" spacing={2}>
        <Grid item xs={3}>
          <Select
            onChange={onFilterNotifications}
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

          {notifications.map((notification, idx) => (
            <ParodosAccordion square key={idx}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id={`panel1bh-header-${notification.id}`}
              >
                <Grid container direction="row" alignItems="center" spacing={2}>
                  <Grid item xs={6}>
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
                    <Typography variant="body2">
                      {(notification.tags || []).map(tag => (
                        <Chip label={tag} size="small" variant="outlined" />
                      ))}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <ButtonGroup>
                      <Button
                        variant="outlined"
                        onClick={getOnDelete(notification)}
                      >
                        Delete
                      </Button>
                      <Button variant="outlined">Button</Button>
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
                  <Grid item xs={2}>
                    {notification.fromuser}
                  </Grid>
                  <Grid item xs={2}>
                    {notification.messageType}
                  </Grid>
                  <Grid item xs={2}>
                    {notification.folder}
                  </Grid>
                  <Grid item xs={6}>
                    {notification.body}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </ParodosAccordion>
          ))}
        </Grid>
        <Grid container direction="row" justifyContent="center">
          <TablePagination
            component="div"
            count={notifications.length}
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
