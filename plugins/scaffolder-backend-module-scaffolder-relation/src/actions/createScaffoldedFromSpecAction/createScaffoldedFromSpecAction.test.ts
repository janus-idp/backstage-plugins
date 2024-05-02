import { getVoidLogger } from '@backstage/backend-common';
import { createMockDirectory } from '@backstage/backend-test-utils';
import { createMockActionContext } from '@backstage/plugin-scaffolder-node-test-utils';

import fs from 'fs-extra';
import yaml from 'yaml';

import { createScaffoldedFromSpecAction } from './createScaffoldedFromSpecAction';

jest.mock('fs-extra');
const fsMock = fs as jest.Mocked<typeof fs>;

describe('catalog:scaffolded-from', () => {
  const action = createScaffoldedFromSpecAction();
  const mockDir = createMockDirectory();
  const workspacePath = mockDir.resolve('workspace');
  const entity = {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'n',
      namespace: 'ns',
    },
    spec: {
      type: 'service',
    },
  };
  const logger = getVoidLogger();
  const mockEntityData = yaml.stringify(entity);
  const mockContext = createMockActionContext({
    templateInfo: {
      baseUrl: 'base-url',
      entityRef: 'template:default/test-template',
    },
    logger,
    workspacePath,
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should append the template entityRef into the catalog-info.yaml of the catalog entity', async () => {
    fsMock.readFile.mockImplementation(async () => mockEntityData);
    fsMock.writeFile.mockImplementation(async () => {});
    await action.handler(mockContext);

    const updatedEntity = yaml.stringify({
      ...entity,
      spec: {
        ...entity.spec,
        scaffoldedFrom: 'template:default/test-template',
      },
    });

    expect(fsMock.writeFile).toHaveBeenCalledWith(
      `${workspacePath}/catalog-info.yaml`,
      updatedEntity,
      'utf8',
    );
  });
});
