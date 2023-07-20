import React from 'react';

import {
  PipelineKind,
  PipelineRunKind,
  pipelineRunStatus,
} from '@janus-idp/shared-react';

import ResourceName from '../../../common/components/ResourceName';
import ResourceStatus from '../../../common/components/ResourceStatus';
import Status from '../../../common/components/Status';
import { PipelineRunModel } from '../../../pipeline-models';
import PLRlastUpdated from './PLRlastUpdated';
import TopologyResourcesTabPanelItem from './TopologyResourcesTabPaneltem';

import './PLRlist.css';

type PLRlistProps = {
  pipelines: PipelineKind[];
  pipelineRuns: PipelineRunKind[];
};

const PLRlist = ({ pipelines, pipelineRuns }: PLRlistProps) => {
  return (
    <TopologyResourcesTabPanelItem
      resourceLabel={PipelineRunModel.labelPlural}
      dataTest="plr-list"
    >
      {pipelines.map((pl: PipelineKind) => (
        <li className="item" key={pl.metadata?.uid}>
          <span style={{ flex: '1' }}>
            <ResourceName name={pl.metadata?.name ?? ''} kind={pl.kind ?? ''} />
          </span>
        </li>
      ))}
      {pipelineRuns.length > 0 ? (
        pipelineRuns.map((plr: PipelineRunKind) => (
          <li
            className="item"
            style={{ alignItems: 'baseline' }}
            key={plr.metadata?.uid}
          >
            <span className="bs-topology-pipelinerun" style={{ flex: '1' }}>
              <ResourceName name={plr.metadata?.name ?? ''} kind="" />
              <PLRlastUpdated plr={plr} />
            </span>
            <span style={{ flex: '1' }}>
              <ResourceStatus
                additionalClassNames="hidden-xs"
                noStatusBackground
              >
                <Status status={pipelineRunStatus(plr)} />
              </ResourceStatus>
            </span>
          </li>
        ))
      ) : (
        <li className="item bs-topology-text-muted">{`No ${PipelineRunModel.labelPlural} found`}</li>
      )}
    </TopologyResourcesTabPanelItem>
  );
};

export default PLRlist;
