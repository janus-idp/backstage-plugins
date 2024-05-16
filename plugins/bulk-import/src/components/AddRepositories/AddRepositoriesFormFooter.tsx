import React, { FormEvent } from 'react';

import { Link } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

import { AddRepositoriesFormValues } from '../../types';
import { getRepositoriesSelected } from '../../utils/repository-utils';

const useStyles = makeStyles(theme => ({
  createButton: {
    marginRight: theme.spacing(1),
  },
  illustration: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-around',
    overflow: 'scroll',
  },
  tooltip: {
    whiteSpace: 'nowrap',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'left',
    position: 'fixed',
    bottom: 0,
    paddingTop: '24px',
    paddingBottom: '24px',
    paddingLeft: '24px',
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    borderTopStyle: 'groove',
    border: theme.palette.divider,
  },
}));

export const AddRepositoriesFormFooter = ({
  approvalTool,
  values,
  handleSubmit,
}: {
  approvalTool: string;
  values: AddRepositoriesFormValues;
  handleSubmit: (e?: FormEvent<HTMLFormElement> | undefined) => void;
}) => {
  const styles = useStyles();
  const submitTitle =
    (approvalTool === 'git'
      ? 'Create pull request'
      : 'Create ServiceNow ticket') +
    (getRepositoriesSelected(values) > 1 ? 's' : '');

  return (
    <div className={styles.footer}>
      <Tooltip
        classes={{ tooltip: styles.tooltip }}
        title="Please wait until the catalog-info.yaml files are generated"
      >
        <span>
          <Button
            variant="contained"
            onClick={handleSubmit as any}
            className={styles.createButton}
            disabled={getRepositoriesSelected(values) === 0}
          >
            {submitTitle}
          </Button>
        </span>
      </Tooltip>
      <Link to="/bulk-import/repositories">
        <Button variant="outlined">Cancel</Button>
      </Link>
    </div>
  );
};
