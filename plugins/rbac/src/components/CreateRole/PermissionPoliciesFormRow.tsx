import React from 'react';

import { makeStyles } from '@material-ui/core';
import RemoveIcon from '@mui/icons-material/Remove';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
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
}: PermissionPoliciesFormRowProps) => {
  const classes = useStyles();
  const [pluginSearch, setPluginSearch] = React.useState('');
  const [permissionSearch, setPermissionSearch] = React.useState('');
  const { plugin: pluginError, permission: permissionError } =
    permissionPoliciesRowError;

  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
      <Autocomplete
        disablePortal
        options={permissionPoliciesData?.plugins ?? []}
        sx={{ width: '450px' }}
        value={permissionPoliciesRowData.plugin}
        isOptionEqualToValue={(option, value) => option === value}
        onChange={(_e, value) => {
          onChangePlugin(value || '');
        }}
        inputValue={pluginSearch}
        onInputChange={(_e, newSearch) => setPluginSearch(newSearch)}
        renderInput={params => (
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
        disablePortal
        disabled={!permissionPoliciesRowData.plugin}
        options={
          permissionPoliciesData?.pluginsPermissions?.[
            permissionPoliciesRowData.plugin
          ]?.permissions ?? []
        }
        sx={{ width: '450px' }}
        isOptionEqualToValue={(option, value) => option === value}
        value={permissionPoliciesRowData.permission}
        onChange={(_e, value) =>
          onChangePermission(
            value || '',
            value
              ? permissionPoliciesData?.pluginsPermissions?.[
                  permissionPoliciesRowData.plugin
                ]?.policies?.[value]
              : undefined,
          )
        }
        inputValue={permissionSearch}
        onInputChange={(_e, newSearch) => setPermissionSearch(newSearch)}
        renderInput={params => (
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
        <RemoveIcon />
      </IconButton>
    </div>
  );
};
