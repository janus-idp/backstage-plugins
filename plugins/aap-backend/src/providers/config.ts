import { readSchedulerServiceTaskScheduleDefinitionFromConfig } from '@backstage/backend-plugin-api';
import type { Config } from '@backstage/config';

import type { AapConfig } from './types';

export function readAapApiEntityConfigs(config: Config): AapConfig[] {
  const providerConfigs = config.getOptionalConfig('catalog.providers.aap');
  if (!providerConfigs) {
    return [];
  }
  return providerConfigs
    .keys()
    .map(id => readAapApiEntityConfig(id, providerConfigs.getConfig(id)));
}

function readAapApiEntityConfig(id: string, config: Config): AapConfig {
  const baseUrl = config.getString('baseUrl');
  const authorization = config.getString('authorization');
  const system = config.getOptionalString('system');
  const owner = config.getOptionalString('owner') ?? 'unknown';

  const schedule = config.has('schedule')
    ? readSchedulerServiceTaskScheduleDefinitionFromConfig(
        config.getConfig('schedule'),
      )
    : undefined;

  return {
    id,
    baseUrl,
    authorization,
    system,
    owner,
    schedule,
  };
}
