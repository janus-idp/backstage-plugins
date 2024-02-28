import { RoleList } from './role-list';

describe('RoleList', () => {
  const roleList = new RoleList('user:default/adam');
  const newRole = new RoleList('role:default/test');
  const extraRole = new RoleList('role:default/extra');
  roleList.addRole(extraRole);

  describe('addRole', () => {
    it('should add a role', () => {
      roleList.addRole(newRole);

      expect(roleList.hasRole('role:default/test', 1)).toEqual(true);
      expect(roleList.hasRole('role:default/does-not-exist', 1)).toEqual(false);
    });

    it('should not add a duplicate of an existing role', () => {
      roleList.addRole(newRole);

      expect(roleList.hasRole('role:default/test', 1)).toEqual(true);
      expect(roleList.hasRole('role:default/does-not-exist', 1)).toEqual(false);
    });
  });

  describe('getRoles', () => {
    it('should return all roles', () => {
      const allRoles = roleList.getRoles();
      expect(allRoles).toEqual([extraRole, newRole]);
    });
  });

  describe('deleteRole', () => {
    it('should remove a role', () => {
      roleList.deleteRole(newRole);

      expect(roleList.hasRole('role:default/test', 1)).toEqual(false);
      expect(roleList.hasRole('role:default/does-not-exist', 1)).toEqual(false);
    });
  });
});
