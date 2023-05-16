import React from 'react';

import {
  EmptyState,
  InfoCard,
  Progress,
  Table,
} from '@backstage/core-components';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { ClusterErrors } from '../../types/types';
import { ClusterSelector, ErrorPanel } from '../common';
import { PipelineRunHeader } from './PipelineRunHeader';

type WrapperInfoCardProps = {
  allErrors?: ClusterErrors;
  showClusterSelector?: boolean;
};

const WrapperInfoCard = ({
  children,
  allErrors,
  showClusterSelector = true,
}: React.PropsWithChildren<WrapperInfoCardProps>) => (
  <>
    {allErrors && allErrors.length > 0 && <ErrorPanel allErrors={allErrors} />}
    <InfoCard
      title="Pipeline Runs"
      {...(showClusterSelector && { subheader: <ClusterSelector /> })}
    >
      {children}
    </InfoCard>
  </>
);

const PipelineRunList = () => {
  const {
    loaded,
    responseError,
    watchResourcesData,
    selectedClusterErrors,
    clusters,
  } = React.useContext(TektonResourcesContext);

  const allErrors: ClusterErrors = [
    ...(responseError ? [{ message: responseError }] : []),
    ...(selectedClusterErrors ?? []),
  ];

  if (!loaded && !responseError)
    return (
      <div data-testid="tekton-progress">
        <Progress />
      </div>
    );

  if (
    loaded &&
    ((!responseError && !watchResourcesData?.pipelineruns?.data?.length) ||
      responseError)
  ) {
    return (
      <WrapperInfoCard
        allErrors={allErrors}
        showClusterSelector={clusters.length > 0}
      >
        <EmptyState missing="data" title="No Pipeline Runs found" />
      </WrapperInfoCard>
    );
  }
  const pipelineRunsData = watchResourcesData?.pipelineruns?.data?.map(d => ({
    ...d,
    id: d.metadata.uid,
  }));

  return (
    <WrapperInfoCard allErrors={allErrors}>
      <Table
        options={{ paging: true, search: false, padding: 'dense' }}
        data={pipelineRunsData || []}
        columns={PipelineRunHeader}
      />
    </WrapperInfoCard>
  );
};

export default PipelineRunList;
