import { resolveSafeChildPath } from '@backstage/backend-plugin-api';

import * as fs from 'fs-extra';
import * as yaml from 'yaml';

export const getObjectToAnnotate = async (
  workspacePath: string,
  objectFilePath: string | undefined,
): Promise<{ [key: string]: any }> => {
  const obj = await fs.readFile(
    resolveSafeChildPath(
      workspacePath,
      objectFilePath || './catalog-info.yaml',
    ),
    'utf8',
  );

  return yaml.parse(obj);
};
