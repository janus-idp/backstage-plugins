import React from 'react';
import { useAsync } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { LinearProgress, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import FormHelperText from '@mui/material/FormHelperText';
import { FormikErrors } from 'formik';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { MemberEntity } from '../../types';
import {
  getChildGroupsCount,
  getMembersCount,
  getParentGroupsCount,
} from '../../utils/create-role-utils';
import { MembersDropdownOption } from './MembersDropdownOption';
import { CreateRoleFormValues, SelectedMember } from './types';

type AddMembersFormProps = {
  selectedMembers: SelectedMember[];
  selectedMembersError?: string;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<CreateRoleFormValues>> | Promise<void>;
};

export const AddMembersForm = ({
  selectedMembers,
  selectedMembersError,
  setFieldValue,
}: AddMembersFormProps) => {
  const rbacApi = useApi(rbacApiRef);
  const [search, setSearch] = React.useState<string>('');
  const {
    loading: membersLoading,
    value: members,
    error,
  } = useAsync(async () => {
    return await rbacApi.getMembers();
  });

  const getDescription = (member: MemberEntity) => {
    const memberCount = getMembersCount(member);
    const parentCount = getParentGroupsCount(member);
    const childCount = getChildGroupsCount(member);

    return member.kind === 'Group'
      ? `${memberCount} members, ${parentCount} parent group, ${childCount} child groups`
      : undefined;
  };

  const membersOptions: SelectedMember[] = members
    ? members.map((member: MemberEntity, index) => ({
        label: member.metadata.name,
        description: getDescription(member),
        etag:
          member.metadata.etag ??
          `${member.metadata.name}-${member.kind}-${index}`,
        type: member.kind,
        namespace: member.metadata.namespace,
        members: getMembersCount(member),
      }))
    : [];

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
        loading={membersLoading}
        loadingText={<LinearProgress />}
        onChange={(_e, value: SelectedMember) =>
          setFieldValue('selectedMembers', [...selectedMembers, value])
        }
        disableClearable
        getOptionDisabled={(option: SelectedMember) =>
          !!selectedMembers.find(
            (sm: SelectedMember) => sm.etag === option.etag,
          )
        }
        renderOption={(option: SelectedMember, state) => (
          <MembersDropdownOption option={option} state={state} />
        )}
        renderInput={params => (
          <TextField
            {...params}
            variant="outlined"
            label="Users and groups"
            placeholder="Search by user name or group name"
            error={!!selectedMembersError}
            helperText={selectedMembersError ?? ''}
            value={search}
            onChange={e => setSearch(e.target.value)}
            required
          />
        )}
      />
      <br />
      {error?.message && (
        <FormHelperText error={!error}>{error.message}</FormHelperText>
      )}
    </>
  );
};
