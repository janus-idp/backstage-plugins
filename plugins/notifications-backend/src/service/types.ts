import {
  PluginDatabaseManager,
  PluginEndpointDiscovery,
  TokenManager,
} from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { IdentityApi } from '@backstage/plugin-auth-node';
import { PermissionEvaluator } from '@backstage/plugin-permission-common';

export interface RouterOptions {
  logger: LoggerService;
  identity: IdentityApi;
  permissions: PermissionEvaluator;
  tokenManager: TokenManager;
  database: PluginDatabaseManager;
  discovery: PluginEndpointDiscovery;
  config: Config;
}

export type NotificationsFilterRequest = {
  /**
   * Filter notifications whose either title or message contains the provided string.
   */
  containsText?: string;

  /**
   * Only notifications created after this timestamp will be included.
   */
  createdAfter?: string;

  /**
   * See MessageScopes
   * Default: DefaultMessageScope
   */
  messageScope?: string;

  /**
   * 'false' for user's unread messages, 'true' for read ones.
   * If undefined, then both marks.
   */
  read?: boolean;
};

/**
 * How the result set is sorted.
 */
export type NotificationsSortingRequest = {
  orderBy?: string;
  orderByDirec?: string;
};

export const NotificationsOrderByFields: string[] = [
  'title',
  'message',
  'created',
  'topic',
  'origin',
];

export const NotificationsOrderByDirections: string[] = ['asc', 'desc'];

/**
 * MessageScopes
 * When 'user' is requested, then messages whose targetUsers or targetGroups are matching the "user".
 * When "system" is requested, only system-wide messages will be filtered (read: those without targetUsers or targetGroups provided).
 * When 'all' is requests then fetch both system and user messages
 */
export const MessageScopes = ['all', 'user', 'system'];
