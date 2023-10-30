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

  return data;
};

export const getUnreadCount = async (
  backendUrl: string,
): Promise<Notification[]> => {
  const response = await fetch(`${backendUrl}/api/notifications/count`);
  const data = await response.json();
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(data.message);
  }

  if (!Array.isArray(data)) {
    throw new Error('Unexpected format of notifications count received');
  }

  return data;
};
