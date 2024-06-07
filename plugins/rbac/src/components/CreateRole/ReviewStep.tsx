import React from 'react';

import { StructuredMetadataTable } from '@backstage/core-components';

import Typography from '@material-ui/core/Typography';

import {
  getConditionsNumber,
  getPermissionsNumber,
} from '../../utils/create-role-utils';
import { getMembers } from '../../utils/rbac-utils';
import { reviewStepMemebersTableColumns } from './AddedMembersTableColumn';
import { ReviewStepTable } from './ReviewStepTable';
import { selectedPermissionPoliciesColumn } from './SelectedPermissionPoliciesColumn';
import { RoleFormValues } from './types';

const tableMetadata = (values: RoleFormValues) => {
  const membersKey =
    values.selectedMembers.length > 0
      ? `Users and groups (${getMembers(values.selectedMembers)})`
      : 'Users and groups';
  const permissionPoliciesKey = `Permission policies (${getPermissionsNumber(
    values,
  )})`;
  const conditionsCount = getConditionsNumber(values);
  const conditionsKey = `Conditional permission policies (${conditionsCount})`;
  return {
    'Name and description of role': (
      <>
        <p style={{ margin: '0px' }}>{values.name}</p>
        <br />
        <p style={{ margin: '0px' }}>{values.description}</p>
      </>
    ),
    [membersKey]: (
      <ReviewStepTable
        rows={values.selectedMembers}
        columns={reviewStepMemebersTableColumns()}
      />
    ),
    [permissionPoliciesKey]: (
      <ReviewStepTable
        rows={values.permissionPoliciesRows.filter(row => !row.conditions)}
        columns={selectedPermissionPoliciesColumn()}
      />
    ),
    ...(conditionsCount > 0
      ? {
          [conditionsKey]: (
            <ReviewStepTable
              rows={values.permissionPoliciesRows.filter(
                row => !!row.conditions,
              )}
              columns={selectedPermissionPoliciesColumn()}
            />
          ),
        }
      : {}),
  };
};

export const ReviewStep = ({
  values,
  isEditing,
}: {
  values: RoleFormValues;
  isEditing: boolean;
}) => {
  return (
    <div style={{ overflow: 'scroll' }}>
      <Typography variant="h6">
        {isEditing ? 'Review and save' : 'Review and create'}
      </Typography>
      <StructuredMetadataTable
        dense
        metadata={tableMetadata(values)}
        options={{ titleFormat: (key: string) => key }}
      />
    </div>
  );
};
