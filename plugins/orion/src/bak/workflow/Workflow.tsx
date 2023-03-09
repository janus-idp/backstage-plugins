import React from 'react';
import {
  ContentHeader,
  ItemCardHeader,
  SupportButton,
} from '@backstage/core-components';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  OutlinedInputProps,
  TextField,
  Typography,
} from '@material-ui/core';

import { useCommonStyles } from '../../styles';
import { ParodosPage } from '../../components/ParodosPage';
import { useBackendUrl } from '../../components/api';
import {
  AssessmentStatusType,
  ProjectType,
  WorkflowDefinitionType,
  WorkFlowTaskParameterType,
} from '../../components/types';
import { WorkflowParameterComponent } from './WorkflowParameterComponent';
import { getWorkflowParameters, startWorkflow } from './commands';
import {
  WorkflowParametersContext,
  WorkflowParametersContextProvider,
} from '../context/WorkflowParametersContext';
import { mockAndromedaWorkflowDefinition } from '../../mocks/workflowDefinitions/andromeda';

const useStyles = makeStyles({
  applicationHeader: {
    background: 'gray',
  },
  applicationCard: {
    height: '15rem',
    width: '17rem',
  },
});

const WorkflowImpl: React.FC = () => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();
  const backendUrl = useBackendUrl();

  const [projectName, setProjectName] = React.useState<string>('');
  const { getParamValue, getParamValidation } = React.useContext(
    WorkflowParametersContext,
  );
  const [project, setProject] = React.useState<ProjectType>();
  const [assessmentStatus, setAssessmentStatus] =
    React.useState<AssessmentStatusType>('none');
  const [assessmentWorkflowDefinition, setAssessmentWorkflowDefinition] =
    React.useState<WorkflowDefinitionType>();
  const [workflowDefinitions, setWorkflowDefinitions] = React.useState<
    WorkflowDefinitionType[]
  >([]);
  const [assessmentParameters, setAssessmentParameters] = React.useState<
    WorkFlowTaskParameterType[]
  >([]);
  const [_, setError] = React.useState<string>();

  const onChangeProjectName: OutlinedInputProps['onChange'] = event => {
    setProjectName(event.target.value);
  };

  // Get a list of the ASSESSMENT workflow parameters to ask the user for
  React.useEffect(() => {
    const doItAsync = async () => {
      const response = await fetch(
        `${backendUrl}/api/proxy/parodos/workflowdefinitions`,
      );
      const allWorkflowDefinitions =
        (await response.json()) as WorkflowDefinitionType[];
      const assessmentDefinition = allWorkflowDefinitions.find(
        def => def.type === 'ASSESSMENT',
      );

      if (!assessmentDefinition) {
        setError('Could not find assessment definition.');
        return;
      }

      const params = getWorkflowParameters(
        allWorkflowDefinitions,
        assessmentDefinition,
      );

      setAssessmentWorkflowDefinition(assessmentDefinition);
      setAssessmentParameters(params);
    };
    doItAsync();
  }, [backendUrl]);

  const onStartAssessment = () => {
    // TODO: get the state dynmically
    setAssessmentStatus('inprogress');

    const doItAsync = async () => {
      if (!assessmentWorkflowDefinition) {
        setError('Missing assessment definition.');
        return;
      }

      try {
        // TODO: shouldn't following be executed as a part of the Assessment workflow?
        // It was said to call following but should be part of the backend flow, imho
        const response = await fetch(
          `${backendUrl}/api/proxy/parodos/projects`,
          {
            method: 'POST',
            body: JSON.stringify({
              name: projectName,
            }),
          },
        );
        const prj = (await response.json()) as ProjectType;
        setProject(prj);

        // Start the assessment workflow
        const executionId = await startWorkflow({
          workflow: assessmentWorkflowDefinition,
          projectId: prj.id,
          getParamValue,
          backendUrl,
          setError,
        });

        // TODO: Implement Cancel - https://issues.redhat.com/browse/FLPATH-101
        // eslint-disable-next-line no-console
        console.log(
          'Assessment executionId: ',
          executionId,
          ', do something about it.',
        );

        // TODO: replace following by proper monitoring
        // https://issues.redhat.com/browse/FLPATH-100
        setAssessmentStatus('complete');
      } catch (e) {
        setError('Failed to start assessment.');
        // eslint-disable-next-line no-console
        console.error('Error: ', e);
      }
    };
    doItAsync();
  };

  // Read workflows to display once the Assessment is over
  React.useEffect(() => {
    const doItAsync = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/proxy/parodos/workflowdefinitions`,
        );
        const allWorkflowDefinitions =
          (await response.json()) as WorkflowDefinitionType[];

        let filteredWorkflowDefinitions = allWorkflowDefinitions.filter(
          workflowDefinition =>
            // TODO: is following correct?
            !['ASSESSMENT', 'CHECKER'].includes(workflowDefinition.type),
        );

        // mock - TODO: remove
        filteredWorkflowDefinitions = [
          mockAndromedaWorkflowDefinition,
          ...filteredWorkflowDefinitions,
        ];

        setWorkflowDefinitions(filteredWorkflowDefinitions);
      } catch (e) {
        setError('Failed to get workflow definitions.');
        // eslint-disable-next-line no-console
        console.error('Error: ', e);
      }
    };
    doItAsync();
  }, [backendUrl]);

  const isStartDisabled =
    assessmentStatus !== 'none' ||
    !projectName ||
    !!assessmentParameters.find(param => {
      // Make sure all required fields are entered
      if (!param.optional && !getParamValue(param.key)) {
        return true;
      }

      return !!getParamValidation(param.key);
    });

  return (
    <ParodosPage>
      <ContentHeader title="Project assessment">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>
        Select a project for an assessment of what additional workflows, if any,
        it qualifies for.
      </Typography>

      <Grid container direction="column" spacing={2}>
        <Grid container direction="row" spacing={2}>
          <Grid item>
            {/* This one seems to be special, on top of the Assessment workflow */}
            <TextField
              id="project-name"
              disabled={assessmentStatus !== 'none'}
              label="Project name"
              variant="outlined"
              value={projectName}
              onChange={onChangeProjectName}
            />
          </Grid>

          <Grid container spacing={3}>
            {assessmentParameters.map(param => (
              <Grid item xs={2} key={param.key}>
                <WorkflowParameterComponent param={param} />
              </Grid>
            ))}
          </Grid>

          <Grid item className={commonStyles.paddingtop1}>
            {assessmentStatus === 'inprogress' ? (
              <Button
                id="assessment-inprogress"
                disabled
                variant="contained"
                color="primary"
              >
                IN PROGRESS
              </Button>
            ) : (
              <Button
                id="assessment-start"
                disabled={isStartDisabled}
                variant="contained"
                onClick={onStartAssessment}
                color="primary"
              >
                START ASSESSMENT
              </Button>
            )}
          </Grid>

          <Grid item>{/* Space saver */}</Grid>
        </Grid>

        {assessmentStatus === 'complete' && (
          <>
            <Typography paragraph className={commonStyles.margintop1}>
              Assessment completed. To continue please select from the following
              option(s):
            </Typography>
            <Grid container direction="row" spacing={2}>
              {workflowDefinitions.map(workflow => (
                <Grid item>
                  <Card
                    key={workflow.name}
                    raised
                    className={styles.applicationCard}
                  >
                    <CardMedia>
                      <ItemCardHeader
                        title={workflow.name}
                        classes={{ root: styles.applicationHeader }}
                      />
                    </CardMedia>
                    <CardContent>{workflow.description}</CardContent>
                    <CardActions>
                      <Button
                        id={workflow.id}
                        variant="text"
                        color="primary"
                        href={`/parodos/onboarding/${project?.id}/${workflow.id}/new/`}
                      >
                        START
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Grid>
    </ParodosPage>
  );
};

export const Workflow: React.FC = props => (
  <WorkflowParametersContextProvider>
    <WorkflowImpl {...props} />
  </WorkflowParametersContextProvider>
);
