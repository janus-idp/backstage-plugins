import * as yup from 'yup';

import { RoleFormValues, SelectedMember } from '../components/CreateRole/types';
import { MemberEntity } from '../types';

export const getRoleData = (values: RoleFormValues) => {
  return {
    memberReferences: values.selectedMembers.map(
      (mem: SelectedMember) => mem.ref,
    ),
    name: `${values.kind}:${values.namespace}/${values.name}`,
  };
};

export const validationSchema = yup.object({
  name: yup.string().required('Name is required'),
  selectedMembers: yup.array().min(1, 'No member selected'),
});

export const getMembersCount = (member: MemberEntity) => {
  return member.kind === 'Group'
    ? member.relations?.reduce((acc: any, relation: { type: string }) => {
        let temp = acc;
        if (relation.type === 'hasMember') {
          temp++;
        }
        return temp;
      }, 0) || 1
    : undefined;
};

export const getParentGroupsCount = (member: MemberEntity) => {
  return member.kind === 'Group'
    ? member.relations?.reduce((acc: any, relation: { type: string }) => {
        let temp = acc;
        if (relation.type === 'childOf') {
          temp++;
        }
        return temp;
      }, 0)
    : undefined;
};

export const getChildGroupsCount = (member: MemberEntity) => {
  return member.kind === 'Group'
    ? member.relations?.reduce((acc: any, relation: { type: string }) => {
        let temp = acc;
        if (relation.type === 'parentOf') {
          temp++;
        }
        return temp;
      }, 0)
    : undefined;
};
