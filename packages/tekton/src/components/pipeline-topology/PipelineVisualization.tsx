import React from 'react';

import {
  BottomLinkProps,
  EmptyState,
  InfoCard,
  Progress,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { Typography } from '@material-ui/core';
import { Split, SplitItem } from '@patternfly/react-core';
import { isEmpty } from 'lodash';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { useDarkTheme } from '../../hooks/useDarkTheme';
import { PipelineRunModel } from '../../models';
import { ClusterErrors } from '../../types/types';
import { pipelineRunStatus } from '../../utils/pipeline-filter-reducer';
import { getGraphDataModel } from '../../utils/pipeline-topology-utils';
import { getLatestPipelineRun } from '../../utils/pipelineRun-utils';
import { ClusterSelector, ErrorPanel, ResourceStatus, Status } from '../common';
import { PipelineLayout } from './PipelineLayout';

import './PipelineVisualization.css';

type PipelineVisualizationProps = {
  linkTekton?: boolean;
  url?: string;
};

type WrapperInfoCardProps = {
  allErrors?: ClusterErrors;
  footerLink?: BottomLinkProps;
  showClusterSelector?: boolean;
};

const WrapperInfoCard = ({
  children,
  allErrors,
  footerLink,
  showClusterSelector = true,
}: React.PropsWithChildren<WrapperInfoCardProps>) => (
  <>
    {allErrors && allErrors.length > 0 && <ErrorPanel allErrors={allErrors} />}
    <InfoCard
      title="Latest Pipeline Run"
      {...(showClusterSelector && { subheader: <ClusterSelector /> })}
      deepLink={footerLink}
    >
      {children}
    </InfoCard>
  </>
);

export const PipelineVisualization = ({
  linkTekton = true,
  url,
}: PipelineVisualizationProps) => {
  useDarkTheme();
  const {
    loaded,
    responseError,
    watchResourcesData,
    selectedClusterErrors,
    clusters,
  } = React.useContext(TektonResourcesContext);

  const { entity } = useEntity();
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

  if (loaded && (responseError || isEmpty(latestPipelineRun))) {
    return (
      <WrapperInfoCard
        allErrors={allErrors}
        showClusterSelector={clusters.length > 0}
      >
        <EmptyState
          missing="data"
          description="No Pipeline Run to visualize"
          title=""
        />
      </WrapperInfoCard>
    );
  }

  const model = getGraphDataModel(
    latestPipelineRun ?? undefined,
    watchResourcesData?.taskruns?.data ?? [],
  );

  return (
    <WrapperInfoCard
      allErrors={allErrors}
      footerLink={
        linkTekton
          ? {
              link: url
                ? url
                : `/catalog/default/component/${entity.metadata.name}/tekton`,
              title: 'GO TO TEKTON',
            }
          : undefined
      }
    >
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
