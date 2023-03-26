import os from 'os';
import { createSonarQubeProjectAction } from './createSonarQubeProject';
import { getVoidLogger } from '@backstage/backend-common';
import { PassThrough } from 'stream';

describe('sonarqube:create-project', () => {
  const action = createSonarQubeProjectAction();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const mockContext = {
    workspacePath: os.tmpdir(),
    logger: getVoidLogger(),
    logStream: new PassThrough(),
    output: jest.fn(),
    createTemporaryDirectory: jest.fn(),
  };

  it('should throw unauthorized error', async () => {
    const response = new Response(new Blob(), { status: 401, statusText: '' });
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.resolve(response));

    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9000',
          token: 'abcdef',
          username: '',
          password: '',
          name: 'test-project',
          key: 'test-project',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(
      Error(
        'Failed to create SonarQube project, status 401 - Unauthorized, please use a valid token or username and password',
      ),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should throw invalid project key error', async () => {
    const projectKey = '+projekt';

    const response = new Response(new Blob(), {
      status: 400,
      statusText: `Malformed key for Project: "${projectKey}". Allowed characters are alphanumeric, '-', '_', '.' and ':', with at least one non-digit.`,
    });
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.resolve(response));

    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9000',
          token: 'abcdef',
          username: '',
          password: '',
          name: 'test-project',
          key: projectKey,
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(
      Error(
        `Failed to create SonarQube project, status 400 - Malformed key for Project: "${projectKey}". Allowed characters are alphanumeric, '-', '_', '.' and ':', with at least one non-digit.`,
      ),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should create a sonarqube project', async () => {
    const response = new Response(new Blob(), { status: 200, statusText: '' });
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementationOnce(() => Promise.resolve(response));

    await action.handler({
      ...mockContext,
      input: {
        baseUrl: 'http://localhost:9090',
        token: 'abcdef',
        username: '',
        password: '',
        name: 'test-project',
        key: 'test-project',
        branch: '',
        visibility: '',
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should throw a required input validation error (baseUrl)', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: '',
          token: 'abcdef',
          username: '',
          password: '',
          name: 'test-project',
          key: 'test-project',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(Error('"baseUrl" is a required input parameter'));
  });

  it('should throw a required input validation error (name)', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9090',
          token: 'abcdef',
          username: '',
          password: '',
          name: '',
          key: 'test-project',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(Error('"name" is a required input parameter'));
  });

  it('should throw a required input validation error (key)', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9090',
          token: 'abcdef',
          username: '',
          password: '',
          name: 'test-project',
          key: '',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(Error('"key" is a required input parameter'));
  });

  it('should throw a required input validation error on missing token or username and password', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9090',
          token: '',
          username: '',
          password: '',
          name: 'test-project',
          key: 'test-project',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(
      Error(
        '"token" or "username" and "password" are required input parameters',
      ),
    );
  });

  it('should throw a required input validation error on missing password', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9090',
          token: '',
          username: 'superuser',
          password: '',
          name: 'test-project',
          key: 'test-project',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(
      Error(
        '"token" or "username" and "password" are required input parameters',
      ),
    );
  });

  it('should throw a required input validation error on missing username', async () => {
    await expect(
      action.handler({
        ...mockContext,
        input: {
          baseUrl: 'http://localhost:9090',
          token: '',
          username: '',
          password: 'super-sEkRiT',
          name: 'test-project',
          key: 'test-project',
          branch: '',
          visibility: '',
        },
      }),
    ).rejects.toThrow(
      Error(
        '"token" or "username" and "password" are required input parameters',
      ),
    );
  });
});
