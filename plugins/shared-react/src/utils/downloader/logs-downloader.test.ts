import { saveAs } from 'file-saver';

import { downloadLogFile } from './logs-downloader';

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

describe('downloadLogFile', () => {
  it('should call saveAs with the correct arguments', () => {
    const data = 'This is a log file content.';
    const filename = 'log-file.txt';

    downloadLogFile(data, filename);

    expect(saveAs).toHaveBeenCalledTimes(1);
    expect(saveAs).toHaveBeenCalledWith(
      new Blob([data], { type: 'text/log;charset=utf-8' }),
      filename,
    );
  });
});
