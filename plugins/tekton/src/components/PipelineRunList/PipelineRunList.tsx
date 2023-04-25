import * as React from 'react';
import { InfoCard, Progress } from '@backstage/core-components';
import PipelineRunHeader from './PipelineRunHeader';
import PipelineRunRow from './PipelineRunRow';
import { Table } from '../Table/Table';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { SortByDirection } from '@patternfly/react-table';

const WrapperInfoCard = ({ children }: { children: React.ReactNode }) => (
  <InfoCard title="Pipeline Runs" subheader="List of Pipeline Runs">
    {children}
  </InfoCard>
);

const PipelineRunList: React.FC = () => {
  const { loaded, responseError, watchResourcesData } = React.useContext(
    TektonResourcesContext,
  );

  if (!loaded && !responseError)
    return (
      <div data-testid="tekton-progress">
        <Progress />
      </div>
    );

  if (
    loaded &&
    !responseError &&
    !watchResourcesData?.pipelineruns?.data?.length
  ) {
    return (
      <WrapperInfoCard>
        <div>No Pipeline Runs found</div>
      </WrapperInfoCard>
    );
  }

  return (
    <WrapperInfoCard>
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
