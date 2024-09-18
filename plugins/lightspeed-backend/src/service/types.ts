import {
  // DiscoveryService,
  // HttpAuthService,
  // UserInfoService,
  LoggerService,
} from '@backstage/backend-plugin-api';
// import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';

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

/**
 * Define the type for the request body of the /session/load endpoint.
 */
export interface SessionLoadRequestBody {
  // A combination of user_id & session_id in the format of <user_id>+<session_id>
  conversation_id: string;

  // number of message history being loaded. default is DEFAULT_HISTORY_LENGTH
  historyLength?: number;
}

// For create AIMessage, HumanMessage, SystemMessage respectively
export const Roles = {
  AIRole: 'ai',
  HumanRole: 'human',
  SystemRole: 'system',
} as const;

// default number of message history being loaded
export const DEFAULT_HISTORY_LENGTH = 10;
