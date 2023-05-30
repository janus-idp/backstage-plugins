import { EmptyState, InfoCard, Progress } from '@backstage/core-components';
import { SortByDirection } from '@patternfly/react-table';
import React from 'react';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { ClusterErrors } from '../../types/types';
import { Table } from '../Table/Table';
import { ClusterSelector, ErrorPanel } from '../common';
import PipelineRunHeader from './PipelineRunHeader';
import PipelineRunRow from './PipelineRunRow';

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

  return (
    <WrapperInfoCard allErrors={allErrors}>
      <div style={{ overflow: 'scroll' }}>
        <Table
          data={watchResourcesData?.pipelineruns?.data || []}
          aria-label="PipelineRuns"
          header={PipelineRunHeader}
          Row={PipelineRunRow}
          defaultSortField="status.startTime"
          defaultSortOrder={SortByDirection.desc}
        />
      </div>
    </WrapperInfoCard>
  );
};

export default PipelineRunList;
