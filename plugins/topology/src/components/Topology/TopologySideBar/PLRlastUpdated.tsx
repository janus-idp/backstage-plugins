import React from 'react';

import { fromNow } from '../../../common/utils/datetime';
import { PipelineRunKind } from '../../../types/pipelineRun';

type PLRlastUpdatedProps = { plr: PipelineRunKind };

const PLRlastUpdated = ({ plr }: PLRlastUpdatedProps) => {
  const { metadata, status } = plr;
  const lastUpdated =
    status?.completionTime || status?.startTime || metadata?.creationTimestamp;

  return lastUpdated ? (
    <>
      <span
        className="bs-topology-text-muted"
        style={{ display: 'inline-block' }}
      >
        ({fromNow(lastUpdated)})
      </span>
    </>
  ) : null;
};

export default PLRlastUpdated;
