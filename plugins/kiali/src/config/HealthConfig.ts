// @ts-nocheck
import { HealthConfig, RegexConfig } from '../types/ServerConfig';

const allMatch = new RegExp('.*');

/* Replace x|X by the regular expression
   Example: 4XX or 5XX to 4\d\d 5\d\d
*/
const replaceXCode = (value: string): string => {
  return value.replace(/x|X/g, '\\d');
};

/*
  Convert the string to regex, if isCode is true then call to replaceXCode to change the X|x in code expression to \d
*/
export const getExpr = (
  value: RegexConfig | undefined,
  isCode: boolean = false,
): RegExp => {
  if (value) {
    if (typeof value === 'string' && value !== '') {
      const v = value.replace('\\\\', '\\');
      return new RegExp(isCode ? replaceXCode(v) : v);
    }
    if (typeof value === 'object' && value.toString() !== '/(?:)/') {
      return value;
    }
  }
  return allMatch;
};

/*
 Parse configuration from backend format to regex expression
*/
export const parseHealthConfig = (healthConfig: HealthConfig) => {
  for (const [key, r] of Object.entries(healthConfig.rate)) {
    healthConfig.rate[key].namespace = getExpr(
      healthConfig.rate[key].namespace,
    );
    healthConfig.rate[key].name = getExpr(healthConfig.rate[key].name);
    healthConfig.rate[key].kind = getExpr(healthConfig.rate[key].kind);
    for (const t of Object.values(r.tolerance)) {
      t.code = getExpr(t.code, true);
      t.direction = getExpr(t.direction);
      t.protocol = getExpr(t.protocol);
    }
  }
  return healthConfig;
};

/*
 Export for tests
*/
export const allMatchTEST = allMatch;
export const getExprTEST = getExpr;
export const replaceXCodeTEST = replaceXCode;
