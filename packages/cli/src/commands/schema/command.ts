import fs from 'fs-extra';

import { paths } from '../../lib/paths';
import { getConfigSchema } from '../../lib/schema/collect';

export default async () => {
  const { name } = await fs.readJson(paths.resolveTarget('package.json'));
  const configSchema = await getConfigSchema(name);

  process.stdout.write(`${JSON.stringify(configSchema, null, 2)}\n`);
};
