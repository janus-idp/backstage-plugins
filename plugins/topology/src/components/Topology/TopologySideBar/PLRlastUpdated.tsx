import React from 'react';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { fromNow } from '../../../common/utils/datetime';

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
