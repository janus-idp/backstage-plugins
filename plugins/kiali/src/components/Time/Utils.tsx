import { TimeInMilliseconds } from '../../types/Common';

const defaultOptions = {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
} as any;

export const toString = (time: TimeInMilliseconds, options?: any): string => {
  const formatOptions = { ...defaultOptions };
  const date = new Date(time);
  if (date.getFullYear() !== new Date().getFullYear()) {
    formatOptions.year = 'numeric';
  }
  return date.toLocaleString('en-US', { ...formatOptions, ...options });
};
