import { GroupTransformer, UserTransformer } from './types';

export const noopGroupTransformer: GroupTransformer = async (
  entity,
  _user,
  _realm,
) => entity;

export const noopUserTransformer: UserTransformer = async (
  entity,
  _user,
  _realm,
  _groups,
) => entity;

/**
 * User transformer that sanitizes .metadata.name from email address to a valid name
 */
export const sanitizeEmailTransformer: UserTransformer = async (
  entity,
  _user,
  _realm,
  _groups,
) => {
  entity.metadata.name = entity.metadata.name.replace(/[^a-zA-Z0-9]/g, '-');
  return entity;
};
