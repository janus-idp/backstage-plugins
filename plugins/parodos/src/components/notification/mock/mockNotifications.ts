import { Notification } from '../type/Notification';

export const mockNotifications: Notification[] = [
  {
    date: 'Dec 17, 2021',
    subject: 'org/repo-name Pipeline creation',
    body: 'We are pleased to inform you that a pipeline for org/repo-name has been successfully created! You are now able to view and manage the deployment stages of your application.',
    from: 'John Doe',
    isRead: false,
  },
  {
    date: 'Jan 24, 2022',
    subject: 'Lorem ipsum dolor sit amet',
    body: 'Lorem ipsum dolor sit amet',
    from: 'Paul Dubois',
    isRead: false,
  },
  {
    date: 'Feb 4, 2023',
    subject: 'Excepteur sint occaecat cupidatat non proident',
    body: 'Excepteur sint occaecat cupidatat non proident',
    from: 'Alice Adele',
    isRead: false,
  },
];
