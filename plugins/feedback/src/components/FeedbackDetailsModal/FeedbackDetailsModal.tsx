import React, { useEffect, useState } from 'react';

import { parseEntityRef } from '@backstage/catalog-model';
import { Progress, useQueryParamState } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { EntityRefLink } from '@backstage/plugin-catalog-react';

import {
  Avatar,
  Button,
  Chip,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Snackbar,
  Theme,
  Tooltip,
  Typography,
  Zoom,
} from '@material-ui/core';
import ArrowForwardRounded from '@material-ui/icons/ArrowForwardRounded';
import BugReportOutlined from '@material-ui/icons/BugReportOutlined';
import CloseRounded from '@material-ui/icons/CloseRounded';
import ExpandLessRounded from '@material-ui/icons/ExpandLessRounded';
import ExpandMoreRounded from '@material-ui/icons/ExpandMoreRounded';
import SmsOutlined from '@material-ui/icons/SmsOutlined';
import { Alert } from '@material-ui/lab';

import { feedbackApiRef } from '../../api';
import { FeedbackType } from '../../models/feedback.model';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    dialogAction: {
      justifyContent: 'flex-start',
      paddingLeft: theme.spacing(3),
      paddingBottom: theme.spacing(2),
    },
    dialogTitle: {
      '& > *': {
        display: 'flex',
        alignItems: 'center',
        marginRight: theme.spacing(2),
        wordBreak: 'break-word',
      },
      '& > * > svg': { marginRight: theme.spacing(1) },

      paddingBottom: theme.spacing(0),
    },
    submittedBy: {
      color: theme.palette.textSubtle,
      fontWeight: 500,
    },
    readMoreLink: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
  }),
);

export const FeedbackDetailsModal = () => {
  const classes = useStyles();
  const api = useApi(feedbackApiRef);
  const [queryState, setQueryState] = useQueryParamState<string | undefined>(
    'id',
  );
  const [modalData, setModalData] = useState<FeedbackType>();
  const [snackbarOpen, setSnackbarOpen] = useState({
    message: '',
    open: false,
  });

  const [ticketDetails, setTicketDetails] = useState<{
    status: string | null;
    assignee: string | null;
    avatarUrls: {} | null;
    element: React.JSX.Element | null;
  }>({ status: null, assignee: null, avatarUrls: null, element: null });

  const [isLoading, setIsLoading] = useState(true);
  const [expandDescription, setExpandDescription] = useState(false);

  useEffect(() => {
    if (modalData?.ticketUrl) {
      api
        .getTicketDetails(
          modalData.feedbackId,
          modalData.ticketUrl,
          modalData.projectId,
        )
        .then(data => {
          setTicketDetails({
            status: data.status,
            assignee: data.assignee,
            avatarUrls: data.avatarUrls,
            element: (
              <>
                <ListItem>
                  <ListItemText primary="Status" />
                  <ListItemSecondaryAction>
                    <ListItemText primary={<Chip label={data.status} />} />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText primary="Assignee" />
                  <ListItemSecondaryAction>
                    <ListItemText
                      primary={
                        <Chip
                          avatar={
                            <Avatar
                              src={
                                data.avatarUrls ? data.avatarUrls['48x48'] : ''
                              }
                            />
                          }
                          label={data.assignee ? data.assignee : 'Unassigned'}
                        />
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </>
            ),
          });
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
    if (!modalData && queryState) {
      api.getFeedbackById(queryState).then(resp => {
        if (resp?.error !== undefined) {
          setSnackbarOpen({ message: resp.error, open: true });
        } else {
          const respData: FeedbackType = resp?.data!;
          setModalData(respData);
        }
      });
    }
  }, [modalData, api, queryState]);

  const handleSnackbarClose = (
    event?: React.SyntheticEvent,
    reason?: string,
  ) => {
    event?.preventDefault();
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen({ ...snackbarOpen, open: false });
    setQueryState(undefined);
  };

  const handleClose = () => {
    setModalData(undefined);
    setTicketDetails({
      status: null,
      assignee: null,
      avatarUrls: null,
      element: null,
    });
    setIsLoading(true);
    setExpandDescription(false);
    setQueryState(undefined);
  };

  const getDescription = (str: string) => {
    if (!expandDescription) {
      if (str.length > 400) {
        if (str.split(' ').length > 1)
          return `${str.substring(0, str.lastIndexOf(' ', 400))}...`;
        return `${str.slice(0, 400)}...`;
      }
    }
    return str;
  };

  return (
    <Dialog
      open={Boolean(queryState)}
      onClose={handleClose}
      aria-labelledby="dialog-title"
      fullWidth
      maxWidth="sm"
      scroll="paper"
    >
      {!modalData ? (
        <Snackbar
          open={snackbarOpen.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert severity="error" onClose={handleSnackbarClose}>
            {snackbarOpen.message}
          </Alert>
        </Snackbar>
      ) : (
        <>
          <DialogTitle className={classes.dialogTitle} id="dialog-title">
            <Tooltip
              title={modalData.feedbackType === 'FEEDBACK' ? 'Feedback' : 'Bug'}
              arrow
              TransitionComponent={Zoom}
            >
              {modalData.feedbackType === 'FEEDBACK' ? (
                <SmsOutlined />
              ) : (
                <BugReportOutlined />
              )}
            </Tooltip>
            {modalData.summary}
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={handleClose}
            >
              <CloseRounded />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Grid
              container
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Grid item xs={12}>
                <Typography className={classes.submittedBy} variant="body2">
                  Submitted by&nbsp;
                  <EntityRefLink entityRef={modalData.createdBy}>
                    {parseEntityRef(modalData.createdBy).name}
                  </EntityRefLink>{' '}
                  on {new Date(modalData.createdAt).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1">
                  {modalData.description
                    ? getDescription(modalData.description)
                    : 'No description provided'}
                </Typography>
                {modalData.description.length > 400 ? (
                  <Link
                    className={classes.readMoreLink}
                    onClick={() => setExpandDescription(!expandDescription)}
                  >
                    {!expandDescription ? (
                      <ExpandMoreRounded />
                    ) : (
                      <ExpandLessRounded />
                    )}
                    {!expandDescription ? 'Read More' : 'Read Less'}
                  </Link>
                ) : null}
              </Grid>
              <Grid item xs={12}>
                <List title="feedback-details-list" disablePadding>
                  <ListItem>
                    <ListItemText
                      primary={
                        modalData.feedbackType === 'FEEDBACK'
                          ? 'Feedback submitted for'
                          : 'Issue raised for'
                      }
                    />
                    <ListItemSecondaryAction>
                      <ListItemText
                        primary={
                          <EntityRefLink entityRef={modalData.projectId}>
                            <Chip
                              clickable
                              variant="outlined"
                              color="primary"
                              label={
                                modalData.projectId.split('/').slice(-1)[0]
                              }
                            />
                          </EntityRefLink>
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Tag" />
                    <ListItemSecondaryAction>
                      <ListItemText
                        primary={
                          <Chip variant="outlined" label={modalData.tag} />
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  {modalData.ticketUrl ? (
                    <ListItem>
                      <ListItemText primary="Ticket Id" />
                      <ListItemSecondaryAction>
                        <ListItemText
                          primary={
                            <Link
                              target="_blank"
                              rel="noopener noreferrer"
                              href={modalData.ticketUrl}
                            >
                              <Chip
                                clickable
                                variant="outlined"
                                label={modalData.ticketUrl.split('/').pop()}
                              />
                            </Link>
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ) : null}
                  {isLoading ? <Progress /> : ticketDetails.element}
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          {modalData.ticketUrl ? (
            <DialogActions className={classes.dialogAction}>
              <Button
                target="_blank"
                endIcon={<ArrowForwardRounded />}
                rel="noopener noreferrer"
                href={modalData.ticketUrl}
                color="primary"
              >
                View Ticket
              </Button>
            </DialogActions>
          ) : null}
        </>
      )}
    </Dialog>
  );
};
