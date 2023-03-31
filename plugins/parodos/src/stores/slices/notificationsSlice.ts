import type { StateCreator } from 'zustand';
import { unstable_batchedUpdates } from 'react-dom';
import type { NotificationsSlice, State, StateMiddleware } from '../types';
import { Notifications } from '../../models/notification';
import * as urls from '../../urls';

export const createNotificationsSlice: StateCreator<
  State,
  StateMiddleware,
  [],
  NotificationsSlice
> = (set, get) => ({
  notificationsLoading: true,
  notificationsError: undefined,
  notifications: [],
  notificationsCount: 0,
  async fetchNotifications({ state: stateParam, page, rowsPerPage }) {
    set(state => {
      state.notificationsLoading = true;
    });

    try {
      // TODO: we can leverage searchTerm param later
      let urlQuery = `?page=${page}&size=${rowsPerPage}&sort=NotificationMessage_createdOn,desc`;
      if (stateParam && stateParam !== 'ALL') {
        urlQuery += `&state=${stateParam}`;
      }

      const response = await fetch(
        `${get().baseUrl}${urls.Notifications}${urlQuery}`,
      );

      const notifications = (await response.json()) || ({} as Notifications);

      const totalElements = notifications.page?.totalElements || 0;
      set(state => {
        unstable_batchedUpdates(() => {
          state.notifications =
            notifications.content ||
            /* Hack: response does not conform swagger, TODO: https://issues.redhat.com/browse/FLPATH-260 */
            notifications?._embedded?.notificationrecords ||
            [];
          state.notificationsLoading = false;
          state.notificationsCount = totalElements;
        });
      });
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error fetching notifications', e);
      set(state => {
        state.notifications = [];
        state.notificationsError = e as Error;
      });
    }
  },
  async deleteNotification({ id }) {
    try {
      await fetch(`${get().baseUrl}${urls.Notifications}/${id}`, {
        method: 'DELETE',
      });
    } catch (e: unknown) {
      set(state => {
        // eslint-disable-next-line no-console
        console.error('Error fetching notifications', e);
        state.notificationsError = e as Error;
      });
    }
  },
  async setNotificationState({ id, newState }) {
    try {
      await fetch(
        `${get().baseUrl}${urls.Notifications}/${id}?operation=${newState}`,
        {
          method: 'PUT',
        },
      );
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error setting notification "', id, '" to: ', newState, e);
      set(state => {
        state.notificationsError = e as Error;
      });
    }
  },
});
