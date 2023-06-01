import React from 'react';

import { Timestamp } from '@patternfly/react-core';
import { chart_color_green_400 as tektonGroupColor } from '@patternfly/react-tokens/dist/js/chart_color_green_400';

import { PipelineRunKind } from '../../types/pipelineRun';
import { pipelineRunDuration } from '../../utils/tekton-utils';
import LinkedPipelineRunTaskStatus from './LinkedPipelineRunTaskStatus';
import { tableColumnClasses } from './pipelinerun-table';
import PlrStatus from './PlrStatus';
import ResourceBadge from './ResourceBadge';

import './PipelineRunRow.css';

const PipelineRunRow = ({ obj }: { obj: PipelineRunKind }) => {
  const startTime = obj?.status?.startTime && new Date(obj.status.startTime);
  return (
    <>
      <td className={tableColumnClasses[0]} role="gridcell">
        {obj?.metadata?.name ? (
          <ResourceBadge color={tektonGroupColor.value} abbr="PLR" name={obj.metadata.name} />
        ) : (
          '-'
        )}
      </td>
      <td className={tableColumnClasses[1]} role="gridcell">
        <PlrStatus obj={obj} />
      </td>
      <td className={tableColumnClasses[2]} role="gridcell">
        <LinkedPipelineRunTaskStatus pipelineRun={obj} />
      </td>
      <td className={tableColumnClasses[3]} role="gridcell">
        {startTime ? <Timestamp className="bs-tkn-timestamp" date={startTime} /> : '-'}
      </td>
      <td className={tableColumnClasses[4]} role="gridcell">
        {pipelineRunDuration(obj)}
      </td>
    </>
  );
};

export default PipelineRunRow;
