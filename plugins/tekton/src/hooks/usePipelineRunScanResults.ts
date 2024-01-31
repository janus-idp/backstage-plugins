import * as React from 'react';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { PipelineRunScanResults } from '../types/types';

const SCAN_OUTPUT_SUFFIX = 'SCAN_OUTPUT';

export const getPipelineRunScanResults = (
  pipelineRun: PipelineRunKind,
): PipelineRunScanResults =>
  (pipelineRun.status?.results || pipelineRun.status?.pipelineResults)?.reduce(
    (acc, result) => {
      if (result.name?.endsWith(SCAN_OUTPUT_SUFFIX)) {
        if (!acc.vulnerabilities) {
          acc.vulnerabilities = { critical: 0, high: 0, medium: 0, low: 0 };
        }
        try {
          const taskVulnerabilities = JSON.parse(result.value);
          if (taskVulnerabilities.vulnerabilities) {
            acc.vulnerabilities.critical +=
              taskVulnerabilities.vulnerabilities.critical || 0;
            acc.vulnerabilities.high +=
              taskVulnerabilities.vulnerabilities.high || 0;
            acc.vulnerabilities.medium +=
              taskVulnerabilities.vulnerabilities.medium || 0;
            acc.vulnerabilities.low +=
              taskVulnerabilities.vulnerabilities.low || 0;
          }
        } catch (e) {
          // ignore
        }
      }
      return acc;
    },
    {} as PipelineRunScanResults,
  ) || {};

export const usePipelineRunScanResults = (
  pipelineRun: PipelineRunKind,
): PipelineRunScanResults => {
  return React.useMemo(() => {
    if (!pipelineRun) {
      return {};
    }

    return getPipelineRunScanResults(pipelineRun);
  }, [pipelineRun]);
};
