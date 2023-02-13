import { readTaskScheduleDefinitionFromConfig } from '@backstage/backend-tasks';
import { Config } from '@backstage/config';
import { ThreeScaleConfig } from './types';

export function readThreeScaleApiEntityConfigs(config: Config): ThreeScaleConfig[] {
  const configs: ThreeScaleConfig[] = [];

  const providerConfigs = config.getOptionalConfig(
    'catalog.providers.threeScaleApiEntity',
  );

  if (!providerConfigs) {
    return configs;
  }

  for (const id of providerConfigs.keys()) {
    configs.push(readThreeScaleApiEntityConfig(id, providerConfigs.getConfig(id)));
  }

  return configs;
}

function readThreeScaleApiEntityConfig(id: string, config: Config): ThreeScaleConfig {

  const baseUrl = config.getString('baseUrl');
  const accessToken = config.getString('accessToken');
  const systemLabel = config.getOptionalString('systemLabel');
  const ownerLabel = config.getOptionalString('ownerLabel');
  const addLabels = config.getOptionalBoolean('addLabels') || true;

  const schedule = config.has('schedule')
    ? readTaskScheduleDefinitionFromConfig(config.getConfig('schedule'))
    : undefined;

  return {
    id,
    baseUrl,
    accessToken,
    systemLabel,
    ownerLabel,
    addLabels,
    schedule,
  };
}