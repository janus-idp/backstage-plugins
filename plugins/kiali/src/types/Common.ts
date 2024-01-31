export type AppenderString = string;

export type UserName = string;
export type Password = string;
export type RawDate = string;

export type KioskMode = string;

export enum HTTP_VERBS {
  DELETE = 'DELETE',
  GET = 'get',
  PATCH = 'patch',
  POST = 'post',
  PUT = 'put',
}

export const PF_THEME_DARK = 'pf-v5-theme-dark';
export const KIALI_THEME = 'kiali-theme';

export const enum Theme {
  LIGHT = 'Light',
  DARK = 'Dark',
}

export type TargetKind = 'app' | 'service' | 'workload';

export const MILLISECONDS = 1000;

export const UNIT_TIME = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 24 * 3600,
};

export type TimeInMilliseconds = number;
export type TimeInSeconds = number;

export type IntervalInMilliseconds = number;
export type DurationInSeconds = number;

export type BoundsInMilliseconds = {
  from?: TimeInMilliseconds;
  to?: TimeInMilliseconds;
};

// Redux doesn't work well with type composition
export type TimeRange = {
  from?: TimeInMilliseconds;
  to?: TimeInMilliseconds;
  rangeDuration?: DurationInSeconds;
};

export const boundsToDuration = (
  bounds: BoundsInMilliseconds,
): DurationInSeconds => {
  return Math.floor(
    ((bounds.to || new Date().getTime()) -
      (bounds.from || new Date().getTime())) /
      1000,
  );
};

export const durationToBounds = (
  duration: DurationInSeconds,
): BoundsInMilliseconds => {
  return {
    from: new Date().getTime() - duration * 1000,
  };
};

export const isEqualTimeRange = (t1: TimeRange, t2: TimeRange): boolean => {
  if (t1.from && t2.from && t1.from !== t2.from) {
    return false;
  }
  if (t1.to && t2.to && t1.to !== t2.to) {
    return false;
  }
  if (
    t1.rangeDuration &&
    t2.rangeDuration &&
    t1.rangeDuration !== t2.rangeDuration
  ) {
    return false;
  }
  return true;
};
