import { ActionContext } from '@backstage/plugin-scaffolder-node';

import { get } from 'lodash';

export const resolveSpec = (
  spec: { [key: string]: any | { readFromContext: string } } | undefined,
  ctx: ActionContext<any>,
) => {
  if (!spec || Object.keys(spec).length === 0) {
    return {};
  }
  return Object.keys(spec).reduce((acc, s) => {
    acc = {
      ...acc,
      ...{
        [`${s}`]:
          spec[s].readFromContext && spec[s].readFromContext !== ''
            ? get(ctx, spec[s].readFromContext)
            : spec[s],
      },
    };
    return acc;
  }, {});
};
