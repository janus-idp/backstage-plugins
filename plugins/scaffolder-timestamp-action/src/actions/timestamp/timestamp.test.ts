import { getVoidLogger, resolveSafeChildPath } from '@backstage/backend-common';
import { Entity } from '@backstage/catalog-model';

import * as fs from 'fs-extra';
import * as yaml from 'yaml';

import { PassThrough } from 'stream';

import { createTimestampAction } from './timestamp';

describe('catalog:timestamping', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call action', async () => {
    const action = createTimestampAction();

    const logger = getVoidLogger();
    jest.spyOn(logger, 'info');

    await action.handler({
      workspacePath: 'src/actions/timestamp/mocks',
      logger,
      logStream: new PassThrough(),
      output: jest.fn(),
      createTemporaryDirectory() {
        // Usage of createMockDirectory is recommended for testing of filesystem operations
        throw new Error('Not implemented');
      },
    } as any);

    const updatedCatalogInfoYaml = await fs.readFile(
      resolveSafeChildPath(
        'src/actions/timestamp/mocks',
        './catalog-info.yaml',
      ),
      'utf8',
    );

    const entity: Entity = yaml.parse(updatedCatalogInfoYaml);

    expect(logger.info).toHaveBeenCalledWith(
      'Annotating catalog-info.yaml with current timestamp',
    );
    expect(
      entity?.metadata?.annotations?.['backstage.io/createdAt'],
    ).toBeTruthy();

    // undo catalog-info.yaml file changes
    delete entity?.metadata?.annotations?.['backstage.io/createdAt'];

    await fs.writeFile(
      resolveSafeChildPath(
        'src/actions/timestamp/mocks',
        './catalog-info.yaml',
      ),
      yaml.stringify(entity),
      'utf8',
    );
  });
});
