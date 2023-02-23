import { ProjectStatusType } from './types';

export const HumanReadableProjectStatus: {
  [key in ProjectStatusType]: string;
} = {
  'in-progress': 'In Progress',
  'on-boarded': 'On Boarded',
  'all-projects': '', // Should not appear in the table
};

export const getHumanReadableDate = (isoTime: string): string => {
  const date = new Date(isoTime);
  // TODO: improve this
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};
