export type NotificationAction = {
  id: string; // UUID
  title: string;
  url: string;
};

export type Notification = {
  id: string; // UUID
  created: Date;
  readByUser: boolean;
  isSystem: boolean;

  origin: string; // mandatory
  title: string; // mandatory
  message?: string;
  topic?: string;

  actions: NotificationAction[];
};

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
  containsText?: string;
  createdAfter?: Date;
  messageScope?: 'all' | 'user' | 'system';
  user?: string;
  read?: string; // 'false' for unread. 'true' for read. undefined for both
};

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
