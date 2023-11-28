import { mockMembers } from '../__fixtures__/mockMembers';
import {
  getChildGroupsCount,
  getMembersCount,
  getParentGroupsCount,
  getRoleData,
} from './create-role-utils';

describe('getRoleData', () => {
  it('should return role data object', () => {
    const values = {
      name: 'testRole',
      namespace: 'default',
      selectedMembers: [
        { type: 'User', namespace: 'default', label: 'user1', etag: '1' },
        { type: 'Group', namespace: 'default', label: 'group1', etag: '2' },
      ],
    };

    const result = getRoleData(values);

    expect(result).toEqual({
      memberReferences: ['user:default/user1', 'group:default/group1'],
      name: 'role:default/testRole',
    });
  });
});

describe('getMembersCount', () => {
  it('should return the number of members for a group', () => {
    const group = mockMembers[0];

    const result = getMembersCount(group);

    expect(result).toBe(2);
  });

  it('should return undefined for non-group entities', () => {
    const user = mockMembers[2];

    const result = getMembersCount(user);

    expect(result).toBeUndefined();
  });
});

describe('getParentGroupsCount', () => {
  it('should return the number of parent groups for a group', () => {
    const group = mockMembers[0];

    const result = getParentGroupsCount(group);

    expect(result).toBe(1);
  });

  it('should return undefined for non-group entities', () => {
    const user = mockMembers[2];

    const result = getParentGroupsCount(user);

    expect(result).toBeUndefined();
  });
});

describe('getChildGroupsCount', () => {
  it('should return the number of child groups for a group', () => {
    const group = mockMembers[8];

    const result = getChildGroupsCount(group);

    expect(result).toBe(2);
  });

  it('should return undefined for non-group entities', () => {
    const user = mockMembers[2];

    const result = getChildGroupsCount(user);

    expect(result).toBeUndefined();
  });
});
