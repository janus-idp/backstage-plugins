import React from 'react';

import {
  pipelineRunFilterReducer,
  PipelineRunKind,
  Status,
} from '@janus-idp/shared-react';

type PlrStatusProps = { obj: PipelineRunKind };

const PlrStatus = ({ obj }: PlrStatusProps) => {
  const plrStatus = pipelineRunFilterReducer(obj);
  return <Status status={plrStatus} />;
};

export default PlrStatus;
