import React from 'react';

import { IconButton } from '@material-ui/core';
import DownloadIcon from '@material-ui/icons/GetApp';

import { downloadLogFile } from '@janus-idp/shared-react';

type PodLogsDownloadProps = {
  logText?: string;
  fileName: string;
};

const PodLogsDownload = ({ logText, fileName }: PodLogsDownloadProps) => {
  return logText ? (
    <IconButton
      aria-label="download logs"
      onClick={() => downloadLogFile(logText, `${fileName}.log`)}
      size="small"
      color="primary"
    >
      <DownloadIcon fontSize="small" />
      Download
    </IconButton>
  ) : null;
};

export default PodLogsDownload;
