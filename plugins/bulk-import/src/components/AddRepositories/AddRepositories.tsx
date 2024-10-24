import React from 'react';

import { makeStyles } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import FormControl from '@mui/material/FormControl';
import { useFormikContext } from 'formik';

import { useDrawer } from '@janus-idp/shared-react';

import { AddRepositoriesFormValues, PullRequestPreviewData } from '../../types';
import { PreviewFileSidebar } from '../PreviewFile/PreviewFileSidebar';
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

export const AddRepositories = ({
  error,
}: {
  error: { message: string; title: string } | null;
}) => {
  const styles = useStyles();
  const { openDrawer, setOpenDrawer, drawerData } = useDrawer();
  const { setFieldValue, values } =
    useFormikContext<AddRepositoriesFormValues>();

  const closeDrawer = () => {
    setOpenDrawer(false);
  };

  const handleSave = (pullRequest: PullRequestPreviewData, _event: any) => {
    Object.keys(pullRequest).forEach(pr => {
      setFieldValue(
        `repositories.${pr}.catalogInfoYaml.prTemplate`,
        pullRequest[pr],
      );
    });
    setOpenDrawer(false);
  };

  return (
    <>
      <FormControl fullWidth>
        <div className={styles.body}>
          {error && (
            <div style={{ paddingBottom: '10px' }}>
              <Alert severity="error">
                <AlertTitle>{error?.title}</AlertTitle>
                {error?.message}
              </Alert>
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
      {openDrawer && (
        <PreviewFileSidebar
          open={openDrawer}
          onClose={closeDrawer}
          data={drawerData}
          repositoryType={values.repositoryType}
          handleSave={handleSave}
        />
      )}
    </>
  );
};
