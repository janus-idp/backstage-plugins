import React, { useEffect } from 'react';

import '@one-platform/opc-feedback';

import {
  configApiRef,
  identityApiRef,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';

import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import { feedbackApiRef } from '../../api';
import { FeedbackCategory } from '../../models/feedback.model';
import { rootRouteRef, viewDocsRouteRef } from '../../routes';

export const OpcFeedbackComponent = () => {
  const appConfig = useApi(configApiRef);
  const feedbackApi = useApi(feedbackApiRef);
  const identityApi = useApi(identityApiRef);

  const footer = JSON.stringify({
    name: appConfig.getString('app.title'),
    url: appConfig.getString('app.baseUrl'),
  });
  const projectId = appConfig.getString('feedback.baseEntityRef');
  const summaryLimit =
    appConfig.getOptionalNumber('feedback.summaryLimit') || 240;
  const docsSpa = useRouteRef(viewDocsRouteRef);
  const feedbackSpa = useRouteRef(rootRouteRef);

  const [snackbarState, setSnackbarState] = React.useState<{
    message?: string;
    open: boolean;
    severity: 'success' | 'error';
  }>({
    message: '',
    open: false,
    severity: 'success',
  });

  const handleSnackbarClose = (
    event?: React.SyntheticEvent,
    reason?: string,
  ) => {
    event?.preventDefault();
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarState({ ...snackbarState, open: false });
  };

  useEffect(() => {
    const onSubmit = async (event: any) => {
      if (event.detail.data.summary.trim().length < 1) {
        setSnackbarState({
          message: 'Summary cannot be empty',
          severity: 'error',
          open: true,
        });
        throw Error('Summary cannot be empty');
      }
      const userEntity = (await identityApi.getBackstageIdentity())
        .userEntityRef;
      const resp = await feedbackApi.createFeedback({
        summary: event.detail.data.summary,
        description: '',
        projectId: projectId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        createdBy: userEntity,
        tag:
          event.detail.data.category === 'BUG'
            ? event.detail.data.error
            : event.detail.data.experience,
        feedbackType:
          event.detail.data.category === 'BUG'
            ? FeedbackCategory.BUG
            : FeedbackCategory.FEEDBACK,
      });
      if (resp.error) {
        setSnackbarState({
          message: resp.error,
          severity: 'error',
          open: true,
        });
        throw new Error(resp.error);
      } else {
        setSnackbarState({
          message: resp.message,
          severity: 'success',
          open: true,
        });
      }
    };
    const elem: any = document.querySelector('opc-feedback');
    elem.onSubmit = onSubmit;
  }, [feedbackApi, projectId, identityApi]);

  return (
    <>
      <Snackbar
        open={snackbarState?.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert severity={snackbarState.severity} onClose={handleSnackbarClose}>
          {snackbarState?.message}
        </Alert>
      </Snackbar>
      <opc-feedback
        docs={docsSpa()}
        spa={feedbackSpa()}
        theme="blue"
        app={footer}
        summaryLimit={summaryLimit}
      />
    </>
  );
};
