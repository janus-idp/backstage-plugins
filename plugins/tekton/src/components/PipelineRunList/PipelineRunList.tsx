import React from 'react';

import { InfoCard, Progress, Table } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { ClusterErrors } from '../../types/types';
import { ClusterSelector, ErrorPanel } from '../common';
import { PipelineRunHeader } from './PipelineRunHeader';

type WrapperInfoCardProps = {
  allErrors?: ClusterErrors;
  showClusterSelector?: boolean;
};

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

const WrapperInfoCard = ({
  children,
  allErrors,
  showClusterSelector = true,
}: React.PropsWithChildren<WrapperInfoCardProps>) => (
  <>
    {allErrors && allErrors.length > 0 && <ErrorPanel allErrors={allErrors} />}
    <InfoCard {...(showClusterSelector && { title: <ClusterSelector /> })}>
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
  const classes = useStyles();

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

  const pipelineRunsData = watchResourcesData?.pipelineruns?.data?.map(d => ({
    ...d,
    id: d.metadata.uid,
  }));

  return (
    <WrapperInfoCard
      allErrors={allErrors}
      showClusterSelector={clusters.length > 0}
    >
      <Table
        title="Pipeline Runs"
        options={{ paging: true, search: false, padding: 'dense' }}
        data={pipelineRunsData || []}
        columns={PipelineRunHeader}
        emptyContent={
          <div data-testid="no-pipeline-runs" className={classes.empty}>
            No Pipeline Runs found
          </div>
        }
      />
    </WrapperInfoCard>
  );
};

export default PipelineRunList;
