import { resolveSafeChildPath } from '@backstage/backend-common';
import { Entity } from '@backstage/catalog-model';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

import * as fs from 'fs-extra';
import * as yaml from 'yaml';

import { getCurrentTimestamp } from './getCurrentTimestamp';

/**
 * Creates a new `catalog:timestamping` Scaffolder action to annotate catalog-info.yaml with creation timestamp.
 *
 */

export const createTimestampAction = () => {
  return createTemplateAction({
    id: 'catalog:timestamping',
    description:
      'Creates a new `catalog:timestamping` Scaffolder action to annotate scaffolded entities with creation timestamp.',

    async handler(ctx) {
      const entitySkeleton = await fs.readFile(
        resolveSafeChildPath(ctx.workspacePath, './catalog-info.yaml'),
        'utf8',
      );

      const entity: Entity = yaml.parse(entitySkeleton);

      const result = yaml.stringify({
        ...entity,
        metadata: {
          ...entity.metadata,
          annotations: {
            ...entity.metadata.annotations,
            'backstage.io/createdAt': getCurrentTimestamp(),
          },
        },
      });
      ctx.logger.info(`Annotating catalog-info.yaml with current timestamp`);
      await fs.writeFile(
        resolveSafeChildPath(ctx.workspacePath, './catalog-info.yaml'),
        result,
        'utf8',
      );
    },
  });
};
