import React from 'react';

import { EmptyState, Link, Progress } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import { makeStyles, Table, TableBody, TableHead } from '@material-ui/core';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import { isEmpty } from 'lodash';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { rootRouteRef } from '../../routes';
import { getPipelineRun } from '../../utils/pipelineRun-utils';
import WrapperInfoCard from '../common/WrapperInfoCard';
import { PipelineVisualization } from './PipelineVisualization';

import './PipelineVisualization.css';

type PipelineVisualizationViewProps = {
  pipelineRun: string;
};

const useStyles = makeStyles({
  link: {
    display: 'flex',
    alignItems: 'center',
  },
  linkText: {
    marginLeft: '0.5rem',
    fontSize: '1.1rem',
  },
  tableHead: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
});

export const PipelineVisualizationView = ({
  pipelineRun,
}: PipelineVisualizationViewProps) => {
  const classes = useStyles();
  const rootLink = useRouteRef(rootRouteRef);
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
    <WrapperInfoCard title="Pipeline Run" showClusterSelector={false}>
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

  return (
    <Table>
      <TableHead className={classes.tableHead}>
        <tr>
          <td>
            <Link to={rootLink()} className={classes.link}>
              <KeyboardBackspaceIcon />
              <span className={classes.linkText}>Back to PipelineRun list</span>
            </Link>
          </td>
        </tr>
      </TableHead>
      <TableBody>
        <tr>
          <td>{pipelineRunViz}</td>
        </tr>
      </TableBody>
    </Table>
  );
};
