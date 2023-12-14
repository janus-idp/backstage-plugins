import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { downloadLogFile } from '@janus-idp/shared-react';

import PodLogsDownload from './PodLogsDownload';

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  IconButton: ({ children, ...rest }: React.PropsWithChildren<any>) => (
    <button {...rest}>{children}</button>
  ),
}));

jest.mock('@material-ui/icons/GetApp', () => () => <div>DownloadIcon</div>);

jest.mock('@janus-idp/shared-react', () => ({
  downloadLogFile: jest.fn(),
}));

describe('PodLogsDownload', () => {
  it('renders null when logText is not provided', () => {
    render(<PodLogsDownload fileName="example" />);
    expect(screen.queryByText('Download')).not.toBeInTheDocument();
  });

  it('renders the component with Download button when logText is provided', () => {
    render(<PodLogsDownload logText="Some logs" fileName="example" />);
    const downloadButton = screen.getByRole('button', {
      name: /download logs/i,
    });
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toHaveTextContent('Download');
  });

  it('calls downloadLogFile function with correct arguments when Download button is clicked', () => {
    const logText = 'Some logs';
    const fileName = 'example';
    render(<PodLogsDownload logText={logText} fileName={fileName} />);
    const downloadButton = screen.getByRole('button', {
      name: /download logs/i,
    });

    fireEvent.click(downloadButton);
    expect(downloadLogFile).toHaveBeenCalledWith(logText, `${fileName}.log`);
  });
});
