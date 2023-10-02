import { Notification } from './types';

export const listNotifications = async (
  backendUrl: string,
): Promise<Notification[]> => {
  const response = await fetch(`${backendUrl}/api/myplugin/notifications`);
  const data = await response.json();
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(data.message);
  }
  return data;
};
