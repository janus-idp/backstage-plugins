import { Config } from '@backstage/config';

const OPENSHIFT_TERMINAL_DEFAULT_NAMESPACE = 'openshift-terminal';

export const getDefaultNamespace = (config: Config) =>
  config.getOptionalString('webTerminal.defaultNamespace') ??
  OPENSHIFT_TERMINAL_DEFAULT_NAMESPACE;

const timeInMsBetweenRetries = [
  0, 100, 500, 1000, 1000, 1000, 2000, 2000, 2000, 3000, 5000,
];

export const getTimeInMsBetweenRetries = (retry: number) => {
  return timeInMsBetweenRetries[
    Math.min(retry, timeInMsBetweenRetries.length - 1)
  ];
};

export const waitBetweenRetries = (retry: number) => {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), getTimeInMsBetweenRetries(retry));
  });
};
