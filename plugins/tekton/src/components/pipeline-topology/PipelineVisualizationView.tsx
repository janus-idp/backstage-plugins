import React from 'react';

import { EmptyState, Progress } from '@backstage/core-components';

import { Table, TableBody } from '@material-ui/core';
import { isEmpty } from 'lodash';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { getPipelineRun } from '../../utils/pipelineRun-utils';
import { PipelineVisualization } from './PipelineVisualization';

import './PipelineVisualization.css';

type PipelineVisualizationViewProps = {
  pipelineRun: string;
};

export const PipelineVisualizationView = ({
  pipelineRun,
}: PipelineVisualizationViewProps) => {
  const { loaded, responseError, watchResourcesData } = React.useContext(
    TektonResourcesContext,
  );

  const pipelineRunResource = React.useMemo(
    () =>
      getPipelineRun(watchResourcesData?.pipelineruns?.data ?? [], pipelineRun),
    [watchResourcesData, pipelineRun],
  );

  if (!loaded)
    return (
      <div data-testid="tekton-progress">
        <Progress />
      </div>
    );

  const pipelineRunViz = (
    <>
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
    </>
  );

  return (
    <Table>
      <TableBody>
        <tr>
          <td>{pipelineRunViz}</td>
        </tr>
      </TableBody>
    </Table>
  );
};
