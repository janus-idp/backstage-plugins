import React from 'react';

import { stringifyEntityRef } from '@backstage/catalog-model';

import { LinearProgress, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import FormHelperText from '@mui/material/FormHelperText';
import { FormikErrors } from 'formik';

import { MemberEntity } from '../../types';
import {
  getChildGroupsCount,
  getMembersCount,
  getParentGroupsCount,
} from '../../utils/create-role-utils';
import { MembersDropdownOption } from './MembersDropdownOption';
import { RoleFormValues, SelectedMember } from './types';

type AddMembersFormProps = {
  selectedMembers: SelectedMember[];
  selectedMembersError?: string;
  membersData: { members: MemberEntity[]; loading: boolean; error: Error };
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<RoleFormValues>> | Promise<void>;
};

export const AddMembersForm = ({
  selectedMembers,
  selectedMembersError,
  setFieldValue,
  membersData,
}: AddMembersFormProps) => {
  const [search, setSearch] = React.useState<string>('');
  const [selectedMember, setSelectedMember] = React.useState<SelectedMember>();

  const getDescription = (member: MemberEntity) => {
    const memberCount = getMembersCount(member);
    const parentCount = getParentGroupsCount(member);
    const childCount = getChildGroupsCount(member);

    return member.kind === 'Group'
      ? `${memberCount} members, ${parentCount} parent group, ${childCount} child groups`
      : undefined;
  };

  const membersOptions: SelectedMember[] = membersData.members
    ? membersData.members.map((member: MemberEntity, index: number) => ({
        label: member.spec?.profile?.displayName ?? member.metadata.name,
        description: getDescription(member),
        etag:
          member.metadata.etag ??
          `${member.metadata.name}-${member.kind}-${index}`,
        type: member.kind,
        namespace: member.metadata.namespace,
        members: getMembersCount(member),
        ref: stringifyEntityRef(member),
      }))
    : ([] as SelectedMember[]);

  return (
    <>
      <FormHelperText>
        Search and select users and groups to be added. Selected users and
        groups will appear in the members table.
      </FormHelperText>
      <br />
      <Autocomplete
        options={membersOptions}
        getOptionLabel={(option: SelectedMember) => option.label}
        getOptionSelected={(option: SelectedMember, value: SelectedMember) =>
          option.etag === value.etag
        }
        loading={membersData.loading}
        loadingText={<LinearProgress />}
        disableClearable
        value={selectedMember}
        onChange={(_e, value: SelectedMember) => {
          setSelectedMember(value);
          if (value) {
            setFieldValue('selectedMembers', [...selectedMembers, value]);
          }
        }}
        inputValue={search}
        onInputChange={(_e, newSearch: string) => setSearch(newSearch)}
        getOptionDisabled={(option: SelectedMember) =>
          !!selectedMembers.find(
            (sm: SelectedMember) => sm.etag === option.etag,
          )
        }
        renderOption={(option: SelectedMember, state) => (
          <MembersDropdownOption option={option} state={state} />
        )}
        clearOnEscape
        renderInput={params => (
          <TextField
            {...params}
            variant="outlined"
            label="Users and groups"
            placeholder="Search by user name or group name"
            error={!!selectedMembersError}
            helperText={selectedMembersError ?? ''}
            required
          />
        )}
      />
      <br />
      {membersData.error?.message && (
        <FormHelperText error={!!membersData.error}>
          {`Error fetching user and groups: ${membersData.error.message}`}
        </FormHelperText>
      )}
    </>
  );
};
