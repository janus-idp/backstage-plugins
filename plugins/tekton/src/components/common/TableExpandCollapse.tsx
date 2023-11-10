import React from 'react';

import { IconButton, makeStyles, Tooltip } from '@material-ui/core';
import Collapse from '@material-ui/icons/UnfoldLess';
import Expand from '@material-ui/icons/UnfoldMore';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';

const useStyles = makeStyles({
  expandCollapse: {
    flexGrow: 1,
    textAlign: 'end',
  },
  iconButton: {
    padding: '2px',
  },
});

export const TableExpandCollapse = () => {
  const classes = useStyles();
  const { isExpanded, setIsExpanded } = React.useContext(
    TektonResourcesContext,
  );

  const handleExpandCollaspse = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <div className={classes.expandCollapse}>
      <Tooltip title="Collapse all" placement="top">
        <span>
          <IconButton
            onClick={() => handleExpandCollaspse()}
            disabled={!isExpanded}
            className={classes.iconButton}
          >
            <Collapse />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Expand all" placement="top">
        <span>
          <IconButton
            onClick={() => handleExpandCollaspse()}
            disabled={isExpanded}
            className={classes.iconButton}
          >
            <Expand />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
