import {
  HttpAuthService,
  LoggerService,
  UserInfoService,
  DiscoveryService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { CatalogApi } from '@backstage/catalog-client';

export type RouterOptions = {
  logger: LoggerService;
  config: Config;
  // httpAuth: HttpAuthService;
  // userInfo: UserInfoService;
  // catalogApi: CatalogApi;
};


/**
 * Define the type for the request body of the /v1/query endpoint.
 */
export interface QueryRequestBody {
  // AI model identifier
  model: string;

  // Query message
  query: string;

  // LLM server URL, expected to be the proxy endpoint
  // for example: http://localhost:7007/api/proxy/lightspeed/api
  serverURL: string;

  // A combination of user_id & session_id in the format of <user_id>+<session_id>
  conversation_id: string;
}
