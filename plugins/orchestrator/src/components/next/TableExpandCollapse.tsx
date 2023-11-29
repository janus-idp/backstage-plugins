import React from 'react';

import { IconButton, Tooltip } from '@material-ui/core';
import Collapse from '@material-ui/icons/UnfoldLess';
import Expand from '@material-ui/icons/UnfoldMore';

type TableExpandCollapseProps = {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
};

export const TableExpandCollapse = ({
  isExpanded,
  setIsExpanded,
}: TableExpandCollapseProps) => {
  const handleExpandCollaspse = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <Tooltip title="Collapse all" placement="top">
        <span>
          <IconButton onClick={handleExpandCollaspse} disabled={!isExpanded}>
            <Collapse />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Expand all" placement="top">
        <span>
          <IconButton onClick={handleExpandCollaspse} disabled={isExpanded}>
            <Expand />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};
