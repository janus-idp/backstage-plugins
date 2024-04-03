import React from 'react';

import { makeStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
// import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RemoveIcon from '@mui/icons-material/Remove';
// import Tooltip from '@mui/material/Tooltip';
import { FormikErrors } from 'formik';

import { PermissionsData } from '../../types';
import { ConditionalAccessSidebar } from '../ConditionalAccess/ConditionalAccessSidebar';
import { ConditionRules } from '../ConditionalAccess/types';
import { PoliciesCheckboxGroup } from './PoliciesCheckboxGroup';
import { PluginsPermissionPoliciesData } from './types';

const useStyles = makeStyles(theme => ({
  removeButton: {
    color: theme.palette.grey[500],
    flexGrow: 0,
  },
  conditionalAccessButton: {
    fontSize: theme.typography.fontSize,
  },
}));

type PermissionPoliciesFormRowProps = {
  permissionPoliciesRowData: PermissionsData;
  permissionPoliciesData?: PluginsPermissionPoliciesData;
  permissionPoliciesRowError: FormikErrors<PermissionsData>;
  rowCount: number;
  rowName: string;
  conditionRules: ConditionRules;
  onRemove: () => void;
  onChangePlugin: (plugin: string) => void;
  onChangePermission: (permission: string, policies?: string[]) => void;
  onChangePolicy: (isChecked: boolean, policyIndex: number) => void;
  handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  getPermissionDisabled: (permission: string) => boolean;
};

export const PermissionPoliciesFormRow = ({
  permissionPoliciesRowData,
  permissionPoliciesData,
  permissionPoliciesRowError,
  rowCount,
  rowName,
  conditionRules,
  onRemove,
  onChangePermission,
  onChangePolicy,
  onChangePlugin,
  handleBlur,
  getPermissionDisabled,
}: PermissionPoliciesFormRowProps) => {
  const classes = useStyles();
  const { plugin: pluginError, permission: permissionError } =
    permissionPoliciesRowError;
  const { data: conditionRulesData, error: conditionRulesError } =
    conditionRules;

  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);

  return (
    <div>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
        <Autocomplete
          options={permissionPoliciesData?.plugins ?? []}
          style={{ width: '400px', flexGrow: '1' }}
          value={permissionPoliciesRowData.plugin ?? ''}
          onChange={(_e, value) => {
            onChangePlugin(value ?? '');
          }}
          renderInput={(params: any) => (
            <TextField
              {...params}
              label="Plugin"
              name={`${rowName}.plugin`}
              variant="outlined"
              placeholder="Select a plugin"
              error={!!pluginError}
              helperText={pluginError ?? ''}
              onBlur={handleBlur}
              required
            />
          )}
        />
        <Autocomplete
          disabled={!permissionPoliciesRowData.plugin}
          options={
            permissionPoliciesData?.pluginsPermissions?.[
              permissionPoliciesRowData.plugin
            ]?.permissions ?? []
          }
          style={{ width: '400px', flexGrow: '1' }}
          value={permissionPoliciesRowData.permission ?? ''}
          onChange={(_e, value) =>
            onChangePermission(
              value ?? '',
              value
                ? permissionPoliciesData?.pluginsPermissions?.[
                    permissionPoliciesRowData.plugin
                  ]?.policies?.[value]
                : undefined,
            )
          }
          getOptionDisabled={getPermissionDisabled}
          renderInput={(params: any) => (
            <TextField
              {...params}
              label="Permission"
              name={`${rowName}.permission`}
              variant="outlined"
              placeholder="Select a permission"
              error={!!permissionError}
              helperText={permissionError ?? ''}
              onBlur={handleBlur}
              required
            />
          )}
        />
        <PoliciesCheckboxGroup
          permissionPoliciesRowData={permissionPoliciesRowData}
          onChangePolicy={onChangePolicy}
          rowName={rowName}
        />
        {/* Conditional access feature is a wip and is not fully enabled */}
        {/* <IconButton
          title=""
          color="primary"
          aria-label="conditional-access"
          className={classes.conditionalAccessButton}
          onClick={() => setSidebarOpen(true)}
          disabled={!permissionPoliciesRowData.plugin}
        >
          <ChecklistRtlIcon fontSize="small" />
          Conditional access&nbsp;
          <Tooltip
            title="Define access conditions for the selected plugin. Conditions vary by plugin, with all allowed by default unless specified otherwise."
            placement="top"
          >
            <HelpOutlineIcon fontSize="inherit" />
          </Tooltip>
        </IconButton> */}
        <IconButton
          title="Remove"
          className={classes.removeButton}
          onClick={() => onRemove()}
          disabled={rowCount === 1}
        >
          <RemoveIcon id={`${rowName}-remove`} />
        </IconButton>
      </div>
      <ConditionalAccessSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selPlugin={permissionPoliciesRowData.plugin}
        rules={conditionRulesData?.[`${permissionPoliciesRowData.plugin}`]}
        error={conditionRulesError}
      />
    </div>
  );
};
