import { saveAs } from 'file-saver';

export const downloadLogFile = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'text/log;charset=utf-8' });
  saveAs(blob, filename);
};
