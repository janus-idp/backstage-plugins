import * as React from 'react';

import { makeStyles, Theme } from '@material-ui/core';
import { Tooltip } from '@patternfly/react-core';
import {
  AngleDoubleDownIcon,
  AngleDoubleUpIcon,
  CriticalRiskIcon,
  EqualsIcon,
} from '@patternfly/react-icons';
import { global_palette_blue_300 as lowColor } from '@patternfly/react-tokens/dist/js/global_palette_blue_300';
import { global_palette_gold_400 as mediumColor } from '@patternfly/react-tokens/dist/js/global_palette_gold_400';
import { global_palette_orange_300 as highColor } from '@patternfly/react-tokens/dist/js/global_palette_orange_300';
import { global_palette_red_200 as criticalColor } from '@patternfly/react-tokens/dist/js/global_palette_red_200';
import classNames from 'classnames';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { usePipelineRunScanResults } from '../../hooks/usePipelineRunScanResults';

const useVStyles = makeStyles((theme: Theme) => ({
  pipelineVulnerabilities: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  severityContainer: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'nowrap',
    gap: theme.spacing(0.5),
  },
  severityStatus: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'nowrap',
    gap: theme.spacing(0.5),
  },
  severityCount: {
    fontWeight: 'bold',
  },
  criticalStatus: {
    color: criticalColor.value,
  },
  highStatus: {
    color: highColor.value,
  },
  mediumStatus: {
    color: mediumColor.value,
  },
  lowStatus: {
    color: lowColor.value,
  },
}));

type PipelineRunVulnerabilitiesProps = {
  pipelineRun: PipelineRunKind;
  condensed?: boolean;
};

const PipelineRunVulnerabilities: React.FC<PipelineRunVulnerabilitiesProps> = ({
  pipelineRun,
  condensed,
}) => {
  const classes = useVStyles();
  const scanResults = usePipelineRunScanResults(pipelineRun);

  return (
    <div className={classes.pipelineVulnerabilities}>
      {scanResults?.vulnerabilities ? (
        <>
          <div className={classNames(classes.severityContainer, 'severity')}>
            <span className={classes.severityStatus}>
              <Tooltip content="Critical">
                <CriticalRiskIcon
                  title="Critical"
                  className={classes.criticalStatus}
                />
              </Tooltip>
              {!condensed ? 'Critical' : null}
            </span>
            <span className={classes.severityCount}>
              {scanResults.vulnerabilities.critical || 0}
            </span>
          </div>
          <div className={classNames(classes.severityContainer, 'severity')}>
            <span className={classes.severityStatus}>
              <Tooltip content="High">
                <AngleDoubleUpIcon
                  title="High"
                  className={classes.highStatus}
                />
              </Tooltip>
              {!condensed ? 'High' : null}
            </span>
            <span className={classes.severityCount}>
              {scanResults.vulnerabilities.high || 0}
            </span>
          </div>
          <div className={classNames(classes.severityContainer, 'severity')}>
            <span className={classes.severityStatus}>
              <Tooltip content="Medium">
                <EqualsIcon title="Medium" className={classes.mediumStatus} />
              </Tooltip>
              {!condensed ? 'Medium' : null}
            </span>
            <span className={classes.severityCount}>
              {scanResults.vulnerabilities.medium || 0}
            </span>
          </div>
          <div className={classNames(classes.severityContainer, 'severity')}>
            <span className={classes.severityStatus}>
              <Tooltip content="Low">
                <AngleDoubleDownIcon
                  title="Low"
                  className={classes.lowStatus}
                />
              </Tooltip>
              {!condensed ? 'Low' : null}
            </span>
            <span className={classes.severityCount}>
              {scanResults.vulnerabilities.low || 0}
            </span>
          </div>
        </>
      ) : (
        '-'
      )}
    </div>
  );
};

export default PipelineRunVulnerabilities;
