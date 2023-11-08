export type CreateNotificationRequest = {
  origin: string;
  title: string;
  message?: string;
  actions?: { title: string; url: string }[];
  topic?: string;
  targetUsers?: string[];
  targetGroups?: string[];
};

export type NotificationAction = {
  id: string; // UUID
  title: string;
  url: string;
};

// Keep in sync with FE: plugins/notifications-frontend/src/api/notificationsApi.ts
export type Notification = {
  id: string; // UUID
  created: Date;

  isSystem: boolean;
  readByUser: boolean;

  origin: string;
  title: string; // mandatory
  message?: string;
  topic?: string;

  actions: NotificationAction[];
};

// Keep in sync with FE: plugins/notifications-frontend/src/api/notificationsApi.ts
export type NotificationsFilter = {
  containsText?: string;
  createdAfter?: Date;
  messageScope?: 'all' | 'user' | 'system';
  user?: string;
  read?: string; // 'false' for unread. 'true' for read. undefined for both
};

export type NotificationsQuerySorting = {
  fieldName?: string;
  direction?: string;
};
