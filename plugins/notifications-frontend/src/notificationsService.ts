import { Notification } from './api';

export const listNotifications = async (
  backendUrl: string,
): Promise<Notification[]> => {
  const response = await fetch(
    `${backendUrl}/api/notifications/notifications?pageSize=0&pageNumber=0`,
  );
  const data = await response.json();
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(data.message);
  }

  if (!Array.isArray(data)) {
    throw new Error('Unexpected format of notifications received');
  }

  const notifications: Notification[] = data.map(received => ({
    kind: 'Notification',
    metadata: {
      timestamp: new Date(0 /* TODO: missing in response */),
      uuid: received.id,
      // TODO: labels or other fields
    },
    spec: {
      title: received.title,
      message: received.message,
      actions: [
        /* TODO */
      ],
    },
  }));

  return notifications;
};
