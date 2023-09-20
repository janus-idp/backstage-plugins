import React, { useMemo } from 'react';
import Moment from 'react-moment';

import { InfoCard } from '@backstage/core-components';

import { Button, Link, Typography } from '@material-ui/core';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import GetAppIcon from '@material-ui/icons/GetApp';
import LaunchIcon from '@material-ui/icons/Launch';
import PauseCircleFilledRoundedIcon from '@material-ui/icons/PauseCircleFilledRounded';
import PlayCircleFilledWhiteRoundedIcon from '@material-ui/icons/PlayCircleFilledWhiteRounded';
import PublishIcon from '@material-ui/icons/Publish';
import RemoveCircleRoundedIcon from '@material-ui/icons/RemoveCircleRounded';

import {
  ProcessInstance,
  ProcessInstanceState,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { Paragraph } from '../Paragraph/Paragraph';
import ItemDescriptor from './ItemDescriptor';

interface ProcessDetailsViewerProps {
  selectedInstance: ProcessInstance | undefined;
}

const processInstanceIconCreator = (state: string) => {
  const render = (icon: JSX.Element, text: string) => {
    return (
      <Paragraph>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {icon}
          <Typography
            component="span"
            variant="body2"
            style={{ paddingLeft: '8px' }}
          >
            {text}
          </Typography>
        </div>
      </Paragraph>
    );
  };

  switch (state) {
    case ProcessInstanceState.Active:
      return render(<PlayCircleFilledWhiteRoundedIcon />, 'Active');
    case ProcessInstanceState.Completed:
      return render(<CheckCircleIcon htmlColor="#3e8635" />, 'Complete');
    case ProcessInstanceState.Aborted:
      return render(<RemoveCircleRoundedIcon />, 'Aborted');
    case ProcessInstanceState.Suspended:
      return render(<PauseCircleFilledRoundedIcon />, 'Suspended');
    case ProcessInstanceState.Error:
      return render(<CancelOutlinedIcon color="error" />, 'Error');
    default:
      return <></>;
  }
};

const getProcessInstanceDescription = (processInstance: any) => {
  return {
    id: processInstance.id,
    name: processInstance.processName,
    description: processInstance.businessKey,
  };
};

export const ProcessDetailsViewer = (props: ProcessDetailsViewerProps) => {
  const { selectedInstance } = props;

  const errorInfo = useMemo(() => {
    if (!selectedInstance?.error?.message) {
      return null;
    }
    const nodeName = selectedInstance.nodes.find(
      n => n.definitionId === selectedInstance?.error?.nodeDefinitionId,
    )?.name;
    return (
      <>
        {nodeName && (
          <>
            <Typography variant="caption" style={{ fontWeight: 'bold' }}>
              Node with error
            </Typography>
            <Paragraph>{nodeName}</Paragraph>
          </>
        )}
        <Typography variant="caption" style={{ fontWeight: 'bold' }}>
          Error message
        </Typography>
        <Paragraph>{selectedInstance.error.message}</Paragraph>
      </>
    );
  }, [selectedInstance]);

  return (
    <InfoCard title="Details">
      {selectedInstance === undefined && (
        <Paragraph>No instance selected</Paragraph>
      )}
      {selectedInstance && (
        <div>
          <Typography variant="caption" style={{ fontWeight: 'bold' }}>
            Id
          </Typography>
          <Paragraph>{selectedInstance?.id}</Paragraph>
          <Typography variant="caption" style={{ fontWeight: 'bold' }}>
            Name
          </Typography>
          <Paragraph>{selectedInstance?.processName}</Paragraph>
          {selectedInstance.businessKey && (
            <>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                Business key
              </Typography>
              <Paragraph>{selectedInstance?.businessKey}</Paragraph>
            </>
          )}
          <Typography variant="caption" style={{ fontWeight: 'bold' }}>
            State
          </Typography>
          {processInstanceIconCreator(selectedInstance.state)}
          {errorInfo}
          {selectedInstance.serviceUrl && (
            <>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                Endpoint
              </Typography>
              <Link href={selectedInstance.serviceUrl} target="_blank">
                {selectedInstance.serviceUrl}
              </Link>
              <LaunchIcon />
            </>
          )}
          {selectedInstance.start && (
            <div>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                Start
              </Typography>
              <Paragraph>
                <Moment fromNow>{new Date(`${selectedInstance.start}`)}</Moment>
              </Paragraph>
            </div>
          )}
          {selectedInstance.lastUpdate && (
            <div>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                Last Updated
              </Typography>
              <Paragraph>
                <Moment fromNow>
                  {new Date(`${selectedInstance.lastUpdate}`)}
                </Moment>
              </Paragraph>
            </div>
          )}
          {selectedInstance.end && (
            <div>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                End
              </Typography>
              <Paragraph>
                <Moment fromNow>{new Date(`${selectedInstance.end}`)}</Moment>
              </Paragraph>
            </div>
          )}
          {selectedInstance.parentProcessInstance && (
            <>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                Parent Process
              </Typography>
              <div>
                <Button
                  variant="contained"
                  startIcon={<PublishIcon />}
                  disabled
                >
                  <ItemDescriptor
                    itemDescription={getProcessInstanceDescription(
                      selectedInstance.parentProcessInstance,
                    )}
                  />
                </Button>
              </div>
            </>
          )}
          {selectedInstance?.childProcessInstances?.length && (
            <>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                Sub Processes
              </Typography>
              {selectedInstance?.childProcessInstances?.map(child => (
                <div key={child.id}>
                  <Button
                    variant="contained"
                    startIcon={<GetAppIcon />}
                    disabled
                  >
                    <ItemDescriptor
                      itemDescription={getProcessInstanceDescription(child)}
                    />
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </InfoCard>
  );
};
