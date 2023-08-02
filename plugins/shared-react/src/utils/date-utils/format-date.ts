import { format } from 'date-fns';

export function formatDate(date: string | undefined) {
  if (!date) {
    return 'N/A';
  }

  return format(new Date(date), 'LLL d, yyyy, h:mm a');
}
