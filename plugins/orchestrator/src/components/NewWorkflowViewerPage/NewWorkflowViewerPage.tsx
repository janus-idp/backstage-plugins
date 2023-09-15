import React, { useCallback } from 'react';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { InfoCard } from '@backstage/core-components';
import { errorApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';

import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';

import {
  workflow_json_sample,
  workflow_yaml_sample,
  WorkflowFormat,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { swfApiRef } from '../../api';
import { createWorkflowRouteRef, definitionsRouteRef } from '../../routes';
import { BaseWorkflowPage } from '../BaseWorkflowPage/BaseWorkflowPage';

type FormData = {
  url: string;
};

export const NewWorkflowViewerPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const errorApi = useApi(errorApiRef);
  const swfApi = useApi(swfApiRef);
  const createWorkflowLink = useRouteRef(createWorkflowRouteRef);

  const defaultValues: FormData = {
    url: workflow_json_sample.url,
  };
  const { handleSubmit, register, formState } = useForm<FormData>({
    defaultValues,
    mode: 'onChange',
  });

  const { errors } = formState;

  const navigate = useNavigate();
  const definitionLink = useRouteRef(definitionsRouteRef);

  const handleResult = useCallback(
    async ({ url }: FormData) => {
      if (!url) {
        return;
      }
      try {
        const result = await swfApi.createWorkflowDefinition(url);

        if (!result?.definition.id) {
          errorApi.post(new Error('error importing workflow'));
        } else {
          const workflowFormat = result.uri.endsWith('.json') ? 'json' : 'yaml';
          navigate(
            definitionLink({
              swfId: result.definition.id,
              format: workflowFormat,
            }),
          );
        }
      } catch (e: any) {
        errorApi.post(new Error(e));
      }
    },
    [swfApi, errorApi, navigate, definitionLink],
  );

  const newWorkflow = useCallback(
    (format: WorkflowFormat) => {
      navigate(
        createWorkflowLink({
          format,
        }),
      );
    },
    [createWorkflowLink, navigate],
  );

  function asInputRef(renderResult: UseFormRegisterReturn) {
    const { ref, ...rest } = renderResult;
    return {
      inputRef: ref,
      ...rest,
    };
  }

  const contentItems = [
    <Grid item xs={12} xl={6} key="create-workflow">
      <InfoCard title="Create" subheader="Start authoring from scratch">
        <Button
          color="default"
          variant="outlined"
          style={{ marginTop: 8, marginRight: 8 }}
          onClick={() => newWorkflow('yaml')}
        >
          YAML
        </Button>
        <Button
          color="default"
          variant="outlined"
          style={{ marginTop: 8, marginRight: 8 }}
          onClick={() => newWorkflow('json')}
        >
          JSON
        </Button>
      </InfoCard>
    </Grid>,
    <Grid item xs={12} xl={6} key="import-workflow">
      <InfoCard
        title="Import"
        subheader="Import an existing workflow from a URL"
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <form onSubmit={handleSubmit(handleResult)}>
              <FormControl fullWidth>
                <TextField
                  {...asInputRef(
                    register('url', {
                      required: true,
                      pattern: {
                        value: /https?:\/\/.*/,
                        message: 'Must be a valid URL',
                      },
                    }),
                  )}
                  id="url"
                  label="Workflow URL"
                  margin="normal"
                  variant="outlined"
                  required
                  error={Boolean(errors.url)}
                />
              </FormControl>
              <Button
                color="primary"
                type="submit"
                variant="contained"
                style={{ marginTop: 8, marginRight: 8 }}
              >
                Import
              </Button>
            </form>
          </Grid>
          <Grid item xs={12}>
            <Divider variant="middle" />
          </Grid>
          <Grid item xs={12}>
            <Box>
              <Typography variant="body1">or from a Sample</Typography>
              <Button
                color="default"
                variant="outlined"
                style={{ marginTop: 8, marginRight: 8 }}
                onClick={() => handleResult({ url: workflow_yaml_sample.url })}
              >
                {workflow_yaml_sample.id}
              </Button>
              <Button
                color="default"
                variant="outlined"
                style={{ marginTop: 8, marginRight: 8 }}
                onClick={() => handleResult({ url: workflow_json_sample.url })}
              >
                {workflow_json_sample.id}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </InfoCard>
    </Grid>,
  ];

  return (
    <BaseWorkflowPage>
      <Grid container spacing={2}>
        {isMobile ? contentItems : contentItems.reverse()}
      </Grid>
    </BaseWorkflowPage>
  );
};
