import React from 'react';
import { Link } from 'react-router-dom';

import { TaskRunKind } from '@janus-idp/shared-react';

import {
  getSbomLink,
  hasExternalLink,
  isSbomTaskRun,
} from '../../utils/taskRun-utils';
import LinkToSBomIcon from '../Icons/LinkToSbomIcon';

const PipelineRunSBOMLink: React.FC<{
  sbomTaskRun: TaskRunKind | undefined;
}> = ({ sbomTaskRun }): React.ReactElement | null => {
  const isSBOMTask = isSbomTaskRun(sbomTaskRun);
  const isExternalLink: boolean = hasExternalLink(sbomTaskRun);
  const linkToSbom = getSbomLink(sbomTaskRun);

  if (
    isSBOMTask &&
    isExternalLink &&
    (linkToSbom?.startsWith('http://') || linkToSbom?.startsWith('https://'))
  ) {
    // Link to external page
    return (
      <Link target="_blank" to={linkToSbom}>
        <LinkToSBomIcon data-testid="external-sbom-link" />
      </Link>
    );
  } else if (isSBOMTask && linkToSbom) {
    // Link to internal taskrun page
    return <LinkToSBomIcon data-testid="internal-sbom-link" />;
  }

  return (
    <LinkToSBomIcon
      disabled={!sbomTaskRun || !isSBOMTask}
      data-testid="icon-space-holder"
    />
  );
};

export default PipelineRunSBOMLink;
