import React from 'react';

import { Link } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { useFormikContext } from 'formik';

import { AddRepositoriesFormValues, ApprovalTool } from '../../types';

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
    maxWidth: 'none',
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

export const AddRepositoriesFormFooter = () => {
  const styles = useStyles();
  const { values, handleSubmit } =
    useFormikContext<AddRepositoriesFormValues>();
  const submitTitle =
    (values.approvalTool === ApprovalTool.Git
      ? 'Create pull request'
      : 'Create ServiceNow ticket') +
    (((values.repositories && Object.keys(values.repositories)?.length) || 0) >
    1
      ? 's'
      : '');

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
            disabled={
              !values.repositories ||
              Object.keys(values.repositories).length === 0
            }
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
