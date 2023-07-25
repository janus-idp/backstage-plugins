import { ComputedServerConfig } from '../types';

export const getName = (
  serverConfig: ComputedServerConfig,
  durationSeconds: number,
): string => {
  const name = serverConfig.durations[durationSeconds];
  if (name) {
    return name;
  }
  return `${durationSeconds} seconds`;
};
