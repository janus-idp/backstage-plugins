import React, { useCallback, useMemo } from 'react';
import Moment from 'react-moment';

import { InfoCard } from '@backstage/core-components';

import { Tooltip } from '@material-ui/core';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import OfflineBoltOutlinedIcon from '@material-ui/icons/OfflineBoltOutlined';

import {
  NodeInstance,
  ProcessInstance,
  ProcessInstanceError,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { Paragraph } from '../Paragraph/Paragraph';

interface ProcessTimelineProps {
  selectedInstance: ProcessInstance | undefined;
}

export const ProcessTimeline = (props: ProcessTimelineProps) => {
  const { selectedInstance } = props;

  const nodes: NodeInstance[] = useMemo(
    () => selectedInstance?.nodes ?? [],
    [selectedInstance],
  );
  const error: ProcessInstanceError | undefined = useMemo(
    () => selectedInstance?.error ?? undefined,
    [selectedInstance],
  );

  const render = (icon: JSX.Element, node: NodeInstance) => {
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
          <div style={{ paddingLeft: '8px' }}>{node.name}</div>
        </div>
        <div
          style={{
            paddingLeft: '32px',
          }}
        >
          <small style={{ color: 'grey' }}>
            {node.exit === null ? (
              'Active'
            ) : (
              <Moment fromNow>{new Date(`${node.exit}`)}</Moment>
            )}
          </small>
        </div>
      </Paragraph>
    );
  };
  const renderNode = (node: NodeInstance): JSX.Element => {
    if (error) {
      if (node.definitionId === error.nodeDefinitionId) {
        return render(
          <Tooltip title={error.message ?? 'No message recorded.'}>
            <CancelOutlinedIcon color="error" />
          </Tooltip>,
          node,
        );
      }
    }
    if (node.exit !== null) {
      return render(
        <Tooltip title="Completed">
          <CheckCircleIcon htmlColor="#3e8635" />
        </Tooltip>,
        node,
      );
    }
    return render(
      <Tooltip title="Active">
        <OfflineBoltOutlinedIcon />
      </Tooltip>,
      node,
    );
  };

  const compareNodes = useCallback((nodeA, nodeB) => {
    if (nodeA?.enter < nodeB?.enter) {
      return -1;
    } else if (nodeA?.enter > nodeB?.enter) {
      return 1;
    } else if (nodeA?.exit < nodeB?.exit) {
      return -1;
    } else if (nodeA?.exit > nodeB?.exit) {
      return 1;
    } else if (nodeA?.id < nodeB?.id) {
      return -1;
    } else if (nodeA?.id > nodeB?.id) {
      return 1;
    }

    return 0;
  }, []);

  if (selectedInstance === undefined) {
    return (
      <InfoCard title="Timeline">
        <Paragraph>No instance selected</Paragraph>
      </InfoCard>
    );
  }
  if (nodes.length === 0) {
    return (
      <InfoCard title="Timeline">
        <Paragraph>No nodes in workflow</Paragraph>
      </InfoCard>
    );
  }

  return (
    <InfoCard title="Timeline">
      <div>
        {nodes.sort(compareNodes).map(node => {
          return <div key={node.id}>{renderNode(node)}</div>;
        })}
      </div>
    </InfoCard>
  );
};
