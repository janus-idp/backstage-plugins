export class RoleList {
  public name: string;

  private roles: RoleList[];

  public constructor(name: string) {
    this.name = name;
    this.roles = [];
  }

  public addRole(role: RoleList): void {
    if (this.roles.some(n => n.name === role.name)) {
      return;
    }
    this.roles.push(role);
  }

  public deleteRole(role: RoleList): void {
    this.roles = this.roles.filter(n => n.name !== role.name);
  }

  public hasRole(name: string, hierarchyLevel: number): boolean {
    if (this.name === name) {
      return true;
    }
    if (hierarchyLevel <= 0) {
      return false;
    }
    for (const role of this.roles) {
      if (role.hasRole(name, hierarchyLevel - 1)) {
        return true;
      }
    }

    return false;
  }

  getRoles(): RoleList[] {
    return this.roles;
  }
}
