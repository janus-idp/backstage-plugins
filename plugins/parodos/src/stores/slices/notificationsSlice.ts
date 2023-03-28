import type { StateCreator } from 'zustand';
import { unstable_batchedUpdates } from 'react-dom';
import type { NotificationsSlice, State, StateMiddleware } from '../types';
import { Notifications } from '../../models/notification';
import * as urls from '../../urls';

// TODO: remove following
let mockNotifications: Notifications = {
  // skipping links
  content: [
    {
      id: '1',
      subject: 'My subject',
      body: 'My body',
      fromuser: 'myuser',
      read: false,
      createdOn: '2023-03-24T13:37:29.980+00:00',
      messageType: 'my-type',
      tags: ['my-tag'],
      folder: 'my-folder',
    },
    {
      id: '2',
      subject: 'My subject 2',
      body: 'My body 2',
      fromuser: 'myuser',
      read: false,
      createdOn: '2023-03-24T13:37:29.980+00:00',
      messageType: 'my-type2',
      tags: ['my-tag', 'my-tag'],
      folder: 'my-folder',
    },
    {
      id: '3',
      subject: 'My subject 3',
      body: 'My body 3',
      fromuser: 'myuser',
      read: false,
      createdOn: '2023-03-24T13:37:29.980+00:00',
      messageType: 'my-type',
      tags: [],
      folder: 'my-folder',
    },
  ],
  page: {
    number: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
  },
};

export const createNotificationsSlice: StateCreator<
  State,
  StateMiddleware,
  [],
  NotificationsSlice
> = (set, get) => ({
  notificationsLoading: true,
  notificationsError: undefined,
  notifications: [],
  async fetchNotifications({ state: stateParam, page, rowsPerPage }) {
    set(state => {
      state.notificationsLoading = true;
    });

    try {
      // TODO: we can leverage searchTerm param later
      // or the "srot" param for pagination
      let urlQuery = `?page=${page}&size=${rowsPerPage}`;
      if (stateParam && stateParam !== 'ALL') {
        urlQuery += `&state=${stateParam}`;
      }

      // eslint-disable-next-line no-alert
      console.info('Using mock notifications...');
      const notifications = mockNotifications;

      // TODO: Uncomment once backend is ready:
      // console.log('--- about to fetch');
      // const response = await fetch(
      //   `${get().baseUrl}${urls.Notifications}${urlQuery}`,
      // );

      // const notifications = (await response.json() ) || [];
      // console.log('--- notifications: ', notifications);

      set(state => {
        unstable_batchedUpdates(() => {
          state.notifications = notifications.content;
          state.notificationsLoading = false;
        });
      });
    } catch (e) {
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
      // TODO: Uncomment once backend is ready:
      // await fetch(`${get().baseUrl}${urls.Notifications}/${id}`, {
      //   method: 'DELETE',
      // });

      // mock: TODO: remove
      mockNotifications.content = mockNotifications.content.filter(
        n => n.id !== id,
      );
    } catch (e) {
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
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error setting notification "', id, '" to: ', newState, e);
      set(state => {
        state.notificationsError = e as Error;
      });
    }
  },
});
