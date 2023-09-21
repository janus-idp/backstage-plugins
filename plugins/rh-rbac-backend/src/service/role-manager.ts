import { RoleManager } from 'casbin';

export class BackstageRoleManager implements RoleManager {
  clear(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  addLink(_name1: string, _name2: string, ..._domain: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  deleteLink(
    _name1: string,
    _name2: string,
    ..._domain: string[]
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  hasLink(
    _name1: string,
    _name2: string,
    ..._domain: string[]
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  syncedHasLink?(
    _name1: string,
    _name2: string,
    ..._domain: string[]
  ): boolean {
    throw new Error('Method not implemented.');
  }
  getRoles(_name: string, ..._domain: string[]): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  getUsers(_name: string, ..._domain: string[]): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  printRoles(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
