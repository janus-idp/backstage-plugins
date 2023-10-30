export type CreateNotificationRequest = {
  origin: string;
  title: string;
  message?: string;
  actions?: { title?: string; url: string }[];
  topic?: string;
  targetUsers?: string[];
  targetGroups?: string[];
};

// Keep in sync with FE: plugins/notifications-frontend/src/api/notificationsApi.ts
// TODO: Once we have more to share, we will introduce a notifications-common library.
export type Notification = {
  id: string; // UUID
  created: Date;

  readByUser: boolean;

  origin: string;
  title: string; // mandatory
  message?: string;
  topic?: string;

  actions?: { title?: string; url: string }[];
};

export type NotificationsFilter = {
  containsText?: string;
  createdAfter?: Date;
};
