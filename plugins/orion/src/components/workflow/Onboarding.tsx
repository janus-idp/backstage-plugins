import React from 'react';
import { ContentHeader, Link, SupportButton } from '@backstage/core-components';
import { Button, ButtonGroup, Chip, Typography } from '@material-ui/core';
import { useParams } from 'react-router-dom';
import { ParodosPage } from '../ParodosPage';
import { ApplicationType } from '../types';
import { mockApplications } from './mockData';

// TODO: use WorkflowStepper component

export const Onboarding: React.FC<{ isNew?: boolean }> = ({ isNew }) => {
  const { appId } = useParams();
  const [application, setApplication] = React.useState<ApplicationType>();
  const [error, setError] = React.useState<string>();
  const [isStartDisabled, setIsStartDisabled] = React.useState<boolean>(true);

  // TODO: use real data
  const applications: ApplicationType[] = mockApplications;

  React.useEffect(() => {
    const app = applications.find(app => app.id === appId);
    if (!app) {
      setError('Could not find application');
    }
    setApplication(app);
  }, [appId]);

  const onStart = () => {
    // eslint-disable-next-line no-console
    console.log('TODO: onStart');
  };

  return (
    <ParodosPage>
      {error && <Typography>{error}</Typography>}
      {!error && isNew && <Chip label="New application" color="secondary" />}

      {!error && (
        <ContentHeader title={`${application?.name || '...'}`}>
          <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
        </ContentHeader>
      )}
      <Typography paragraph>
        You are onboarding {application?.id || '...'}.
      </Typography>
      <Typography paragraph>
        Please provide additional information related to your project.
      </Typography>

      <ButtonGroup>
        <Button
          variant="contained"
          color="primary"
          onClick={onStart}
          disabled={isStartDisabled}
        >
          Start
        </Button>
        <Button variant="text" color="primary" href="/parodos/project-overview">
          Cancel onboarding
        </Button>
      </ButtonGroup>
    </ParodosPage>
  );
};
