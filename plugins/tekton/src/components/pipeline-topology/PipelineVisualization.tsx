import React from 'react';
import { isEmpty } from 'lodash';
import { Split, SplitItem } from '@patternfly/react-core';
import { Typography } from '@material-ui/core';
import { EmptyState, InfoCard, Progress } from '@backstage/core-components';
import { ResourceStatus, Status } from '../common';
import { pipelineRunStatus } from '../../utils/pipeline-filter-reducer';
import { PipelineLayout } from './PipelineLayout';
import { useDarkTheme } from '../../hooks/useDarkTheme';
import { getGraphDataModel } from '../../utils/pipeline-topology-utils';
import { PipelineRunModel } from '../../models';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { getLatestPipelineRun } from '../../utils/pipelineRun-utils';
import { ErrorPanel, ClusterSelector } from '../common';
import { ClusterErrors } from '../../types/types';

import './PipelineVisualization.css';

const WrapperInfoCard = ({
  children,
  allErrors,
}: {
  children: React.ReactNode;
  allErrors?: ClusterErrors;
}) => (
  <>
    {allErrors && allErrors.length > 0 && <ErrorPanel allErrors={allErrors} />}
    <InfoCard title="Latest Pipeline Run" subheader={<ClusterSelector />}>
      {children}
    </InfoCard>
  </>
);

export const PipelineVisualization: React.FC = () => {
  useDarkTheme();
  const { loaded, responseError, watchResourcesData, selectedClusterErrors } =
    React.useContext(TektonResourcesContext);

  const allErrors: ClusterErrors = [
    ...(responseError ? [{ message: responseError }] : []),
    ...(selectedClusterErrors ?? []),
  ];
  const latestPipelineRun = React.useMemo(
    () =>
      getLatestPipelineRun(
        watchResourcesData?.pipelineruns?.data ?? [],
        'creationTimestamp',
      ),
    [watchResourcesData],
  );

  if (!loaded)
    return (
      <div data-testid="tekton-progress">
        <Progress />
      </div>
    );

  if (
    loaded &&
    (!responseError || responseError?.length === 0) &&
    (!latestPipelineRun || isEmpty(latestPipelineRun))
  ) {
    return (
      <WrapperInfoCard allErrors={allErrors}>
        <EmptyState
          missing="data"
          description="No Pipeline Run to visualize"
          title={''}
        />
      </WrapperInfoCard>
    );
  }

  const model = getGraphDataModel(
    latestPipelineRun ?? undefined,
    watchResourcesData?.taskrun?.data ?? [],
  );

  return (
    <WrapperInfoCard allErrors={allErrors}>
      {latestPipelineRun?.metadata?.name && (
        <Split className="bs-tkn-pipeline-visualization__label">
          <SplitItem style={{ marginRight: 'var(--pf-global--spacer--sm)' }}>
            <span
              className="badge"
              style={{ backgroundColor: PipelineRunModel.color }}
            >
              {PipelineRunModel.abbr}
            </span>
          </SplitItem>
          <SplitItem>
            <Typography variant="h6">
              {latestPipelineRun.metadata.name}
              <ResourceStatus additionalClassNames="hidden-xs">
                <Status status={pipelineRunStatus(latestPipelineRun) ?? ''} />
              </ResourceStatus>
            </Typography>
          </SplitItem>
        </Split>
      )}
      {!model || (model.nodes.length === 0 && model.edges.length === 0) ? (
        <div data-testid="pipeline-no-tasks">
          This Pipeline Run has no tasks to visualize
        </div>
      ) : (
        <div
          data-testid="pipeline-visualization"
          className="bs-tkn-pipeline-visualization__layout"
        >
          <PipelineLayout model={model} />
        </div>
      )}
    </WrapperInfoCard>
  );
};
