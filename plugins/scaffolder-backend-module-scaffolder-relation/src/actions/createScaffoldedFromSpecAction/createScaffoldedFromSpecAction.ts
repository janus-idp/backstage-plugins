import { resolveSafeChildPath } from '@backstage/backend-common';
import { Entity } from '@backstage/catalog-model';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

import * as fs from 'fs-extra';
import * as yaml from 'yaml';

type TemplateActionParameters = {
  catalogInfoName?: string;
};

const actionId = 'catalog:scaffolded-from';

const examples = [
  {
    description: 'Append template entityRef to the catalog-info.yaml',
    example: yaml.stringify({
      steps: [
        {
          action: actionId,
          id: 'add-scaffolded-from',
          name: 'Append template entityRef',
        },
      ],
    }),
  },
];
/**
 * Creates a new `catalog:scaffolded-from` scaffolder action that
 * annotates the catalog-info.yaml of an entity with the entityRef of the template that created it.
 *
 * @public
 */

export const createScaffoldedFromSpecAction = () => {
  return createTemplateAction<TemplateActionParameters>({
    id: actionId,
    description:
      'Creates a new `catalog:scaffolded-from` scaffolder action to annotate a catalog-info.yaml with the entityRef of the template that created it.',
    examples,
    async handler(ctx) {
      const filePath = './catalog-info.yaml';

      const entityContent = await fs.readFile(
        resolveSafeChildPath(ctx.workspacePath, filePath),
        'utf8',
      );
      const entity: Entity = yaml.parse(entityContent);

      const updatedEntity = yaml.stringify({
        ...entity,
        spec: {
          ...entity.spec,
          scaffoldedFrom: ctx.templateInfo?.entityRef,
        },
      });
      ctx.logger.info(
        `Annotating catalog-info.yaml with template entityRef: ${ctx.templateInfo?.entityRef}`,
      );
      await fs.writeFile(
        resolveSafeChildPath(ctx.workspacePath, filePath),
        updatedEntity,
        'utf8',
      );
    },
  });
};
