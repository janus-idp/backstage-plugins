import React from 'react';

import { Link } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';

import { AddRepositoriesFormValues } from '../../types';
import { getRepositoriesSelected } from '../../utils/repository-utils';
import { AddRepositoriesTable } from './AddRepositoriesTable';

const useStyles = makeStyles(theme => ({
  createButton: {
    marginRight: theme.spacing(1),
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'left',
    marginTop: theme.spacing(2),
    position: 'fixed',
    bottom: 0,
    backgroundColor: theme.palette.background.default,
    width: '100%',
  },
}));

export const AddRepositoriesForm = ({
  initialValues,
}: {
  initialValues: AddRepositoriesFormValues;
}) => {
  const styles = useStyles();

  const formik = useFormik<AddRepositoriesFormValues>({
    enableReinitialize: true,
    initialValues,
    onSubmit: async (_values: AddRepositoriesFormValues) => {},
  });
  const submitTitle =
    (formik.values.approvalTool === 'git'
      ? 'Create pull request'
      : 'Create ServiceNow ticket') +
    (getRepositoriesSelected(formik.values) > 1 ? 's' : '');

  return (
    <>
      <AddRepositoriesTable
        title="Selected repositories"
        selectedRepositoriesFormData={formik.values}
        setFieldValue={formik.setFieldValue}
      />
      <FormControl>
        <Typography variant="h6">Approval tool</Typography>
        <RadioGroup
          id="approval-tool"
          data-testid="approval-tool"
          row
          aria-labelledby="approval-tool"
          name="approvalTool"
          value={formik.values.approvalTool}
          onChange={formik.handleChange}
        >
          <FormControlLabel value="git" control={<Radio />} label="Git" />
          <FormControlLabel
            value="servicenow"
            control={<Radio />}
            label="ServiceNow"
          />
        </RadioGroup>
        <br />
        <div className={styles.footer}>
          <Tooltip title="Please wait until the catalog-info.yaml files are generated">
            <span>
              <Button
                variant="contained"
                onClick={formik.handleSubmit as any}
                className={styles.createButton}
                disabled={getRepositoriesSelected(formik.values) === 0}
              >
                {submitTitle}
              </Button>
            </span>
          </Tooltip>
          <Link to="/bulk-import/repositories">
            <Button variant="outlined">Cancel</Button>
          </Link>
        </div>
      </FormControl>
    </>
  );
};
