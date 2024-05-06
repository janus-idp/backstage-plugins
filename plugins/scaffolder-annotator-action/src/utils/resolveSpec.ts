import { ActionContext } from '@backstage/plugin-scaffolder-node';

import { get } from 'lodash';

export type Value = string | { readFromContext: string };

export const resolveSpec = (
  spec: { [key: string]: Value } | undefined,
  ctx: ActionContext<any>,
) => {
  if (!spec || Object.keys(spec).length === 0) {
    return {};
  }
  return Object.keys(spec).reduce((acc, s) => {
    const val = spec[s];
    return {
      ...acc,
      ...{
        [`${s}`]:
          typeof val === 'string' ? spec[s] : get(ctx, val.readFromContext),
      },
    };
  }, {});
};
