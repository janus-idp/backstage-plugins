import React from 'react';

import { EmptyState, Progress } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { isEmpty } from 'lodash';

import { getLatestPipelineRun } from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { ClusterErrors } from '../../types/types';
import WrapperInfoCard from '../common/WrapperInfoCard';
import { PipelineVisualization } from './PipelineVisualization';

type PipelineVisualizationCardProps = {
  linkTekton?: boolean;
  url?: string;
};

export const PipelineVisualizationCard = ({
  linkTekton,
  url,
}: PipelineVisualizationCardProps) => {
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
  const pipelineRunResource = React.useMemo(
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

  const showClusterSelector = clusters.length > 0;

  return (
    <WrapperInfoCard
      allErrors={allErrors}
      showClusterSelector={showClusterSelector}
      title="Latest Pipeline Run"
      footerLink={
        linkTekton
          ? {
              link:
                url ||
                `/catalog/default/component/${entity.metadata.name}/tekton`,
              title: 'GO TO TEKTON',
            }
          : undefined
      }
    >
      {loaded && (responseError || isEmpty(pipelineRunResource)) ? (
        <EmptyState
          missing="data"
          description="No Pipeline Run to visualize"
          title=""
        />
      ) : (
        <PipelineVisualization
          pipelineRun={pipelineRunResource}
          taskRuns={watchResourcesData?.taskruns?.data ?? []}
        />
      )}
    </WrapperInfoCard>
  );
};
