import { resolveSafeChildPath } from '@backstage/backend-common';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

import * as fs from 'fs-extra';
import * as yaml from 'yaml';

import { convertLabelsToObject } from '../../utils/convertLabelsToObject';
import { getObjectToAnnotate } from '../../utils/getObjectToAnnotate';
import { resolveSpec } from '../../utils/resolveSpec';

/**
 * Creates a new Scaffolder action to annotate a catalog-info.yaml with desired lable(s), annotation(s) and spec property(ies).
 *
 */

export const createAnnotatorAction = (
  actionId: string,
  actionDescription: string,
  loggerInfoMsg?: string,
  annotateEntityObject?: {
    annotations?: { [key: string]: any };
    labels?: { [key: string]: any };
    spec?: { [key: string]: any | { readFromContext: string } };
  },
) => {
  return createTemplateAction<{
    labels?: string;
    annotations?: string;
    objectFilePath?: string;
    objectYaml?: object;
    writeToFile?: string;
  }>({
    id: actionId,
    description: actionDescription,
    schema: {
      input: {
        type: 'object',
        properties: {
          labels: {
            title: 'Labels',
            description: 'Labels that will be applied to the object',
            type: 'string',
          },
          annotations: {
            title: 'Annotations',
            description: 'Annotations that will be applied to the object',
            type: 'string',
          },
          objectFilePath: {
            title: 'Object File Path',
            description: 'Path to the object yaml you want to annonate',
            type: 'string',
          },
          objectYaml: {
            title: 'Object Yaml',
            description: 'Any object yaml you want to annonate',
            type: 'object',
          },
          writeToFile: {
            title: 'Write To File',
            description: 'Path to the file you want to write',
            type: 'string',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          annotatedObject: {
            type: 'object',
            title:
              'The object annotated with your desired annotation(s), label(s) and spec property(ies)',
          },
        },
      },
    },
    async handler(ctx) {
      let objToAnnotate: { [key: string]: any };

      if (ctx.input?.objectYaml) {
        objToAnnotate = { ...ctx.input?.objectYaml };
      } else {
        objToAnnotate = await getObjectToAnnotate(
          ctx.workspacePath,
          ctx.input?.objectFilePath,
        );
      }
      const annotatedObj = {
        ...objToAnnotate,
        metadata: {
          ...objToAnnotate.metadata,
          annotations: {
            ...(objToAnnotate.metadata.annotations || {}),
            ...(annotateEntityObject?.annotations || {}),
            ...convertLabelsToObject(ctx.input?.annotations),
          },
          labels: {
            ...(objToAnnotate.metadata.labels || {}),
            ...(annotateEntityObject?.labels || {}),
            ...convertLabelsToObject(ctx.input?.labels),
          },
        },
        spec: {
          ...(objToAnnotate.spec || {}),
          ...(resolveSpec(annotateEntityObject?.spec, ctx) || {}),
        },
      };

      const result = yaml.stringify(annotatedObj);
      ctx.logger.info(loggerInfoMsg || 'Annotating your object');
      if (
        Object.keys(annotateEntityObject || {}).length > 0 &&
        (Object.keys(annotateEntityObject?.labels || {}).length > 0 ||
          Object.keys(annotateEntityObject?.annotations || {}).length > 0 ||
          Object.keys(annotateEntityObject?.spec || {}).length > 0)
      ) {
        await fs.writeFile(
          resolveSafeChildPath(ctx.workspacePath, './catalog-info.yaml'),
          result,
          'utf8',
        );
      }

      if (ctx.input?.writeToFile) {
        await fs.writeFile(
          resolveSafeChildPath(ctx.workspacePath, ctx.input.writeToFile),
          result,
          'utf8',
        );
      }
      ctx.output('annotatedObject', result);
    },
  });
};
