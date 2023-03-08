/* eslint-disable no-console */
import React from 'react';
import {
  ContentHeader,
  InfoCard,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ParodosPage } from '../ParodosPage';
import {
  Button,
  ButtonGroup,
  Chip,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { useWorkflowDefinitionToJsonSchema } from '../../hooks/useWorkflowDefinitionToJsonSchema';
import { assert } from 'assert-ts';
import { Stepper } from './Stepper';
import { useGetWorkflowDefinition } from '../../hooks/useGetWorkflowDefinitions';

interface OnboardingProps {
  isNew: boolean;
}

const useStyles = makeStyles(theme => ({
  start: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    width: '50%',
  },
  cancel: {
    textTransform: 'none',
    paddingLeft: 0,
  },
}));

export function Onboarding({ isNew }: OnboardingProps): JSX.Element {
  const { workflowId, projectId } = useParams();
  const styles = useStyles();

  assert(!!workflowId, `no workflowId in Onboarding`);

  const {
    loading,
    error,
    value: formSchema,
  } = useWorkflowDefinitionToJsonSchema(workflowId, 'byId');

  const { value: workflow } = useGetWorkflowDefinition(workflowId, 'byId');

  const navigate = useNavigate();

  const onStart = async () => {
    console.log(workflow);
    console.log(navigate);
    console.log(projectId);
  };

  return (
    <ParodosPage>
      {error && <Typography>{error}</Typography>}
      {!error && isNew && <Chip label="New application" color="secondary" />}

      {!error && (
        <ContentHeader title={`${workflow?.name || '...'}`}>
          <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
        </ContentHeader>
      )}
      <Typography paragraph>
        You are onboarding {workflow?.id || '...'}.
      </Typography>
      {loading && <Progress />}
      {formSchema?.schema && (
        <InfoCard>
          <Typography paragraph>
            Please provide additional information related to your project.
          </Typography>
          <Stepper formSchema={formSchema} onSubmit={onStart}>
            <ButtonGroup orientation="vertical">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={styles.start}
              >
                Start
              </Button>
              <Button
                variant="text"
                component={Link}
                color="primary"
                to="/parodos/project-overview"
                className={styles.cancel}
              >
                Cancel and exit onboarding
              </Button>
            </ButtonGroup>
          </Stepper>
        </InfoCard>
      )}
    </ParodosPage>
  );
}
