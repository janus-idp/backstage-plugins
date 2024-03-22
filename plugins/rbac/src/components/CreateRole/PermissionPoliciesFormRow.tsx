import React from 'react';

import { makeStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import RemoveIcon from '@mui/icons-material/Remove';
import { FormikErrors } from 'formik';

import { PermissionsData } from '../../types';
import { PoliciesCheckboxGroup } from './PoliciesCheckboxGroup';
import { PluginsPermissionPoliciesData } from './types';

const useStyles = makeStyles(theme => ({
  removeButton: {
    color: theme.palette.grey[500],
  },
}));

type PermissionPoliciesFormRowProps = {
  permissionPoliciesRowData: PermissionsData;
  permissionPoliciesData?: PluginsPermissionPoliciesData;
  permissionPoliciesRowError: FormikErrors<PermissionsData>;
  rowCount: number;
  rowName: string;
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

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
      <Autocomplete
        options={permissionPoliciesData?.plugins ?? []}
        style={{ width: '450px' }}
        value={permissionPoliciesRowData.plugin ?? ''}
        onChange={(_e, value) => onChangePlugin(value ?? '')}
        renderInput={(params: any) => (
          <TextField
            {...params}
            label="Plugin"
            name={`${rowName}.plugin`}
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
        style={{ width: '450px' }}
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
      <IconButton
        title="Remove"
        className={classes.removeButton}
        onClick={() => onRemove()}
        disabled={rowCount === 1}
      >
        <RemoveIcon id={`${rowName}-remove`} />
      </IconButton>
    </div>
  );
};
