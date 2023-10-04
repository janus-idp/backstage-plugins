import type { Config } from '@backstage/config';

import type { OpenAPIConfig } from '../../../../generated/now/table';

/**
 * Update the OpenAPIConfig with the ServiceNow configuration
 *
 * @param {OpenAPIConfig} OpenAPI - The OpenAPIConfig to update
 * @param {Config} config - The ServiceNow configuration to use
 */
export function updateOpenAPIConfig(
  OpenAPI: OpenAPIConfig,
  config: Config,
): void {
  OpenAPI.BASE = config.getString('servicenow.baseUrl');
  OpenAPI.USERNAME = config.getString('servicenow.username');
  OpenAPI.PASSWORD = config.getString('servicenow.password');
}
