import type { Config } from '@backstage/config';
import type { JsonObject } from '@backstage/types';

export type CreateActionOptions = {
  config: Config;
};

export type ServiceNowResponse = {
  result: JsonObject;
};
