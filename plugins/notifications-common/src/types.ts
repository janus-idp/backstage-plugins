export type NotificationAction = {
  id: string; // UUID
  title: string;
  url: string;
};

/**
 * Basic object representing a notification.
 */
export type Notification = {
  id: string; // UUID
  created: Date;
  readByUser: boolean;
  isSystem: boolean;

  origin: string;
  title: string;
  message?: string;
  topic?: string;

  actions: NotificationAction[];
};

/**
 * Input data for the POST request (create a notification).
 */
export type CreateNotificationRequest = {
  origin: string;
  title: string;
  message?: string;
  actions?: { title: string; url: string }[];
  topic?: string;
  targetUsers?: string[];
  targetGroups?: string[];
};

export type NotificationsFilterRequest = {
  /**
   * Filter notifications whose either title or message contains the provided string.
   */
  containsText?: string;

  /**
   * Only notifications created after this timestamp will be included.
   */
  createdAfter?: Date;

  /**
   * See MessageScopes
   * Default: DefaultMessageScope
   */
  messageScope?: string;

  /**
   * The user the query is executed for. Default: DefaultUser
   * Its entity must be present in the catalog.
   * Conforms IdentityApi.getBackstageIdentity()
   */
  user?: string;
  /**
   * 'false' for user's unread messages, 'true' for read ones.
   * If undefined, then both marks.
   */
  read?: string;
};

/**
 * How the result set is sorted.
 */
export type NotificationsSortingRequest = {
  fieldName?: string;
  direction?: string;
};

export type NotificationsOrderByFieldsType =
  | 'title'
  | 'message'
  | 'created'
  | 'topic'
  | 'origin';

export const NotificationsOrderByFields: string[] = [
  'title',
  'message',
  'created',
  'topic',
  'origin',
];

export type NotificationsOrderByDirectionsType = 'asc' | 'desc';

export const NotificationsOrderByDirections: string[] = ['asc', 'desc'];

export type NotificationsQuerySorting = {
  fieldName: NotificationsOrderByFieldsType;
  direction: NotificationsOrderByDirectionsType;
};

/**
 * MessageScopes
 * When 'user' is requested, then messages whose targetUsers or targetGroups are matching the "user".
 * When "system" is requested, only system-wide messages will be filtered (read: those without targetUsers or targetGroups provided).
 * When 'all' is requests then fetch both system and user messages
 */
export const MessageScopes = ['all', 'user', 'system'];

export const DefaultUser = 'default/guest';
export const DefaultMessageScope = 'user';
export const DefaultPageNumber = 1;
export const DefaultPageSize = 20;
export const DefaultOrderBy = 'created';
export const DefaultOrderDirection = 'desc';
