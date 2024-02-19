import React from 'react';

import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';

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
      style={{ justifyContent: 'flex-start', gap: '12px', width: '400px' }}
    >
      <FormLabel
        style={{
          fontWeight: 600,
          fontSize: '0.8rem',
        }}
      >
        Policy
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
