import React from 'react';
import { Link } from 'react-router-dom';

import { TaskRunKind } from '@janus-idp/shared-react';

import {
  getSbomLink,
  hasExternalLink,
  isSbomTaskRun,
} from '../../utils/taskRun-utils';
import LinkToSBom from '../Icons/LinkToSbomIcon';

const PipelineRunSBOMLink: React.FC<{
  sbomTaskRun: TaskRunKind | undefined;
  onClick: () => void;
}> = ({ sbomTaskRun, onClick }): React.ReactElement | null => {
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
        <LinkToSBom data-testid="external-sbom-link" />
      </Link>
    );
  } else if (isSBOMTask && linkToSbom) {
    // Link to internal taskrun page
    return <LinkToSBom data-testid="internal-sbom-link" onClick={onClick} />;
  }

  return (
    <LinkToSBom
      disabled={!sbomTaskRun || !isSBOMTask}
      data-testid="icon-space-holder"
    />
  );
};

export default PipelineRunSBOMLink;
