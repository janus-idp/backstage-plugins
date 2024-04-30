import React from 'react';

import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';

import { PermissionsData } from '../../types';
import { RowPolicy } from './types';

export const PoliciesCheckboxGroup = ({
  permissionPoliciesRowData,
  rowName,
  onChangePolicy,
}: {
  permissionPoliciesRowData: PermissionsData;
  rowName: string;

  onChangePolicy: (isChecked: boolean, policyIndex: number) => void;
}) => {
  return (
    <FormControl
      required
      style={{
        justifyContent: 'flex-start',
        gap: '1px',
        width: '402px',
        flexGrow: '1',
        marginBottom: '25px',
      }}
    >
      <FormLabel
        style={{
          fontWeight: 800,
          fontSize: '0.8rem',
        }}
      >
        What actions they can do?
      </FormLabel>
      <FormGroup
        style={{
          display: 'flex',
          gap: '7px',
          flexDirection: 'row',
          paddingLeft: '9px',
        }}
      >
        {permissionPoliciesRowData.policies.map(
          (p: RowPolicy, index: number, self) => {
            const labelCheckedArray = self.filter(
              val => val.effect === 'allow',
            );
            const labelCheckedCount = labelCheckedArray.length;
            return (
              <FormControlLabel
                key={p.policy}
                disabled={
                  !(
                    permissionPoliciesRowData.plugin &&
                    permissionPoliciesRowData.permission
                  ) ||
                  permissionPoliciesRowData.policies.length === 1 ||
                  (labelCheckedCount === 1 &&
                    labelCheckedArray[0].policy === p.policy)
                }
                label={p.policy}
                name={`${rowName}.policies[${index}].policy`}
                control={
                  <Checkbox
                    checked={p.effect === 'allow'}
                    name={`${rowName}.policies[${index}].policy-${p.policy}`}
                    onChange={e => onChangePolicy(e.target.checked, index)}
                    color="primary"
                  />
                }
              />
            );
          },
        )}
      </FormGroup>
    </FormControl>
  );
};
