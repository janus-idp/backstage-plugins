import { OverviewType } from './OverviewToolbar';

export const switchType = <T, U, V>(
  type: OverviewType,
  caseApp: T,
  caseService: U,
  caseWorkload: V,
): T | U | V => {
  if (type === 'app') {
    return caseApp;
  } else if (type === 'service') {
    return caseService;
  }
  return caseWorkload;
};
