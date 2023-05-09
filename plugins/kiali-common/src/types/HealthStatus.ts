import { HealthAnnotationType, ToleranceConfig } from './';

/*
RequestType interface
- where the structure is type {<protocol>: {<code>:value ...} ...}

Example: { "http": {"200": 2, "404": 1 ...} ... }
*/
export interface RequestType {
  [key: string]: { [key: string]: number };
}
export interface RequestHealth {
  inbound: RequestType;
  outbound: RequestType;
  healthAnnotations: HealthAnnotationType;
}

export interface Status {
  name: string;
  color?: string;
  htmlColor?: string;
  priority: number;
}

export interface ProxyStatus {
  CDS: string;
  EDS: string;
  LDS: string;
  RDS: string;
}

export const FAILURE: Status = {
  name: 'Failure',
  color: 'error',
  htmlColor: '#c9190b',
  priority: 4,
};
export const DEGRADED: Status = {
  name: 'Degraded',
  htmlColor: '#f0ab00',
  priority: 3,
};
export const NOT_READY: Status = {
  name: 'Not Ready',
  htmlColor: '#6a6e73',
  priority: 2,
};
export const HEALTHY: Status = {
  name: 'Healthy',
  htmlColor: '#3e8635',
  priority: 1,
};
export const NA: Status = {
  name: 'No health information',
  htmlColor: '#6a6e73',
  priority: 0,
};

export interface Thresholds {
  degraded: number;
  failure: number;
  unit: string;
}

export interface ThresholdStatus {
  value: number;
  status: Status;
  violation?: string;
}

export const POD_STATUS = 'Pod Status';

// Use -1 rather than NaN to allow straigthforward comparison
export const RATIO_NA = -1;

export const ascendingThresholdCheck = (
  value: number,
  thresholds: Thresholds,
): ThresholdStatus => {
  if (value > 0) {
    if (value >= thresholds.failure) {
      return {
        value: value,
        status: FAILURE,
        violation: `${value.toFixed(2)}${thresholds.unit}>=${
          thresholds.failure
        }${thresholds.unit}`,
      };
    } else if (value >= thresholds.degraded) {
      return {
        value: value,
        status: DEGRADED,
        violation: `${value.toFixed(2)}${thresholds.unit}>=${
          thresholds.degraded
        }${thresholds.unit}`,
      };
    }
  }

  return { value: value, status: HEALTHY };
};

export const getRequestErrorsStatus = (
  ratio: number,
  tolerance?: ToleranceConfig,
): ThresholdStatus => {
  if (tolerance && ratio >= 0) {
    const thresholds = {
      degraded: tolerance.degraded,
      failure: tolerance.failure,
      unit: '%',
    };
    return ascendingThresholdCheck(100 * ratio, thresholds);
  }

  return {
    value: RATIO_NA,
    status: NA,
  };
};
