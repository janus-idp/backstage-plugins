import { Paths } from '@backstage/cli-common';

import path from 'path';

import { BackendPluginIDsProvider } from './backend-plugin-ids-provider';

const pathsMock: Partial<Paths> = {
  resolveTargetRoot: jest.fn().mockImplementation(() => {
    return path.resolve('./src/service/test/data/yarn-locks/valid/yarn.lock');
  }),
};

jest.mock('@backstage/cli-common', () => {
  return {
    findPaths: jest.fn((): Partial<Paths> => {
      return pathsMock;
    }),
  };
});

describe('backend-plugin-ids-provider', () => {
  it('should parse test yarn lock and return backend plugin ids', () => {
    const pluginIds = new BackendPluginIDsProvider().getPluginIds();

    expect(pluginIds.length).toEqual(8);
    expect(pluginIds).toContain('app');
    expect(pluginIds).toContain('auth');
    expect(pluginIds).toContain('catalog');
    expect(pluginIds).toContain('permission');
    expect(pluginIds).toContain('proxy');
    expect(pluginIds).toContain('scaffolder');
    expect(pluginIds).toContain('search');
    expect(pluginIds).toContain('techdocs');
  });

  it('should fail to parse broken yarn.lock', () => {
    (pathsMock.resolveTargetRoot as jest.Mock).mockReturnValue(
      './src/service/test/data/yarn-locks/invalid/yarn.lock',
    );
    expect(() => {
      new BackendPluginIDsProvider().getPluginIds();
    }).toThrow(
      `Unknown token: { line: 4, col: 1, type: 'INVALID', value: undefined } 4:1 in lockfile`,
    );
  });
});
