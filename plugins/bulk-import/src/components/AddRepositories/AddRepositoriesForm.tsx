import React from 'react';

import { WarningPanel } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import FormControl from '@mui/material/FormControl';

// import HelpIcon from '@mui/icons-material/HelpOutline';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Radio from '@mui/material/Radio';
// import RadioGroup from '@mui/material/RadioGroup';
// import Tooltip from '@mui/material/Tooltip';
// import Typography from '@mui/material/Typography';
// import { useFormikContext } from 'formik';
// import { AddRepositoriesFormValues } from '../../types';
import { AddRepositoriesFormFooter } from './AddRepositoriesFormFooter';
import { AddRepositoriesTable } from './AddRepositoriesTable';

const useStyles = makeStyles(theme => ({
  body: {
    marginBottom: '50px',
    padding: '24px',
  },
  approvalTool: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'left',
    alignItems: 'center',
    paddingTop: '24px',
    paddingBottom: '24px',
    paddingLeft: '16px',
    backgroundColor: theme.palette.background.paper,
    borderBottomStyle: 'groove',
    border: theme.palette.divider,
  },

  approvalToolTooltip: {
    paddingTop: '4px',
    paddingRight: '24px',
    paddingLeft: '5px',
  },
}));

export const AddRepositoriesForm = ({
  error,
}: {
  error: { message: string; title: string } | null;
}) => {
  const styles = useStyles();

  return (
    <>
      <FormControl fullWidth>
        <div className={styles.body}>
          {error && (
            <div style={{ paddingBottom: '10px' }}>
              <WarningPanel
                message={error?.message}
                title={error?.title}
                severity="error"
              />
            </div>
          )}
          {/* 
          // Enable this when ServiceNow approval tool is supported
          <span className={styles.approvalTool}>
            <Typography fontSize="16px" fontWeight="500">
              Approval tool
            </Typography>
            <Tooltip
              placement="top"
              title="When adding a new repository, it requires approval. Once the PR is approved or the ServiceNow ticket is closed, the repositories will be added to the Catalog page."
            >
              <span className={styles.approvalToolTooltip}>
                <HelpIcon fontSize="small" />
              </span>
            </Tooltip>
            <RadioGroup
              id="approval-tool"
              data-testid="approval-tool"
              row
              name="approvalTool"
              value={values.approvalTool}
              onChange={(_event, value: string) => {
                setFieldValue('approvalTool', value);
              }}
            >
              <FormControlLabel value="git" control={<Radio />} label="Git" />
              <FormControlLabel
                value="servicenow"
                control={<Radio />}
                label="ServiceNow"
                disabled
              />
            </RadioGroup>
          </span> */}
          <AddRepositoriesTable title="Selected repositories" />
        </div>
        <br />
      </FormControl>
      <AddRepositoriesFormFooter />
    </>
  );
};
