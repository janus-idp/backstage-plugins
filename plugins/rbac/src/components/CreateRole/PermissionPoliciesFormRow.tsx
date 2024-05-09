import React from 'react';

import { FormLabel, makeStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import Tooltip from '@mui/material/Tooltip';
import { FormikErrors } from 'formik';

import { PermissionsData } from '../../types';
import { getRulesNumber } from '../../utils/create-role-utils';
import { ConditionalAccessSidebar } from '../ConditionalAccess/ConditionalAccessSidebar';
import { ConditionRules, ConditionsData } from '../ConditionalAccess/types';
import { PoliciesCheckboxGroup } from './PoliciesCheckboxGroup';
import { PluginsPermissionPoliciesData } from './types';

const useStyles = makeStyles(theme => ({
  removeButton: {
    color: theme.palette.grey[500],
    flexGrow: 0,
    alignSelf: 'center',
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
  onChangePermission: (
    permission: string,
    isResourced: boolean,
    policies?: string[],
  ) => void;
  onChangePolicy: (isChecked: boolean, policyIndex: number) => void;
  handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  getPermissionDisabled: (permission: string) => boolean;
  onAddConditions: (conditions?: ConditionsData) => void;
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
  onAddConditions,
}: PermissionPoliciesFormRowProps) => {
  const classes = useStyles();
  const { plugin: pluginError, permission: permissionError } =
    permissionPoliciesRowError;
  const { data: conditionRulesData, error: conditionRulesError } =
    conditionRules;
  const totalRules = getRulesNumber(permissionPoliciesRowData.conditions);

  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);

  return (
    <div>
      <div style={{ display: 'flex', flexFlow: 'column', gap: '15px' }}>
        <FormLabel
          style={{
            fontWeight: 800,
            fontSize: '0.8rem',
          }}
        >
          What can users/groups access?
        </FormLabel>
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '15px',
          }}
        >
          <Autocomplete
            options={permissionPoliciesData?.plugins ?? []}
            style={{ width: '35%', flexGrow: '1' }}
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
            style={{ width: '35%', flexGrow: '1' }}
            value={permissionPoliciesRowData.permission ?? ''}
            onChange={(_e, value) =>
              onChangePermission(
                value ?? '',
                permissionPoliciesData?.pluginsPermissions[
                  permissionPoliciesRowData.plugin
                ]?.policies[value ?? '']?.isResourced ?? false,
                value
                  ? permissionPoliciesData?.pluginsPermissions?.[
                      permissionPoliciesRowData.plugin
                    ]?.policies?.[value].policies
                  : undefined,
              )
            }
            getOptionDisabled={getPermissionDisabled}
            renderInput={(params: any) => (
              <TextField
                {...params}
                label="Resource type"
                name={`${rowName}.permission`}
                variant="outlined"
                placeholder="Select a resource type"
                error={!!permissionError}
                helperText={permissionError ?? ''}
                onBlur={handleBlur}
                required
              />
            )}
          />
          <div style={{ width: '23%', alignSelf: 'center', flexGrow: 1 }}>
            {permissionPoliciesRowData.isResourced &&
              !!conditionRulesData?.[`${permissionPoliciesRowData.plugin}`]?.[
                `${permissionPoliciesRowData.permission}`
              ]?.rules.length && (
                <IconButton
                  title=""
                  color="primary"
                  hidden={
                    !permissionPoliciesData?.pluginsPermissions[
                      permissionPoliciesRowData.plugin
                    ]?.policies[permissionPoliciesRowData.permission]
                      ?.isResourced
                  }
                  aria-label="configure-access"
                  className={classes.conditionalAccessButton}
                  onClick={() => setSidebarOpen(true)}
                  disabled={!!conditionRulesError}
                >
                  <ChecklistRtlIcon fontSize="small" />
                  {totalRules > 0
                    ? `Configure access (${totalRules} ${
                        totalRules > 1 ? `rules` : 'rule'
                      })`
                    : 'Configure access'}
                  &nbsp;
                  <Tooltip
                    title="Define access conditions for the selected resource type using Rules. Rules vary by resource type. Users have access to the resource type content by default unless configured otherwise."
                    placement="top"
                  >
                    <HelpOutlineIcon fontSize="inherit" />
                  </Tooltip>
                </IconButton>
              )}
          </div>
          <IconButton
            title="Remove"
            className={classes.removeButton}
            onClick={() => onRemove()}
            disabled={rowCount === 1}
          >
            <RemoveIcon id={`${rowName}-remove`} />
          </IconButton>
        </div>
      </div>
      <PoliciesCheckboxGroup
        permissionPoliciesRowData={permissionPoliciesRowData}
        onChangePolicy={onChangePolicy}
        rowName={rowName}
      />
      <ConditionalAccessSidebar
        open={sidebarOpen}
        onClose={() => {
          setSidebarOpen(false);
        }}
        onSave={(conditions: ConditionsData) => {
          onAddConditions(conditions);
          setSidebarOpen(false);
        }}
        onRemoveAll={() => onAddConditions(undefined)}
        conditionsFormVal={permissionPoliciesRowData.conditions}
        selPluginResourceType={permissionPoliciesRowData.permission}
        conditionRulesData={
          conditionRulesData?.[`${permissionPoliciesRowData.plugin}`]?.[
            `${permissionPoliciesRowData.permission}`
          ]
        }
      />
    </div>
  );
};
