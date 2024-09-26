import * as React from 'react';

import { makeStyles, Theme } from '@material-ui/core';
import AngleDoubleDownIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import AngleDoubleUpIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined';
import { Tooltip } from '@patternfly/react-core';
import { global_palette_gold_400 as mediumColor } from '@patternfly/react-tokens/dist/js/global_palette_gold_400';
import { global_palette_orange_300 as highColor } from '@patternfly/react-tokens/dist/js/global_palette_orange_300';
import classNames from 'classnames';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { usePipelineRunScanResults } from '../../hooks/usePipelineRunScanResults';
import CriticalRiskIcon from '../Icons/CriticalRiskIcon';
import EqualsIcon from '../Icons/EqualsIcon';

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
    height: '1em',
    width: '1em',
  },
  highStatus: {
    color: highColor.value,
    height: '0.8em',
    width: '0.8em',
  },
  mediumStatus: {
    color: mediumColor.value,
    height: '1.3em',
    width: '1.3em',
  },
  lowStatus: {
    height: '0.8em',
    width: '0.8em',
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
                  className={classes.criticalStatus}
                  title="Critical"
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
                  className={classes.highStatus}
                  titleAccess="High"
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
                <EqualsIcon className={classes.mediumStatus} title="Medium" />
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
                  className={classes.lowStatus}
                  titleAccess="Low"
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
