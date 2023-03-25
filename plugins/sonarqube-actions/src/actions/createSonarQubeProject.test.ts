import os from 'os';
import { createSonarQubeProjectAction } from './createSonarQubeProject';
import { getVoidLogger } from '@backstage/backend-common';
import {PassThrough} from 'stream';


describe('sonarqube:create-project', ()=>{
    const action = createSonarQubeProjectAction();

    const mockContext ={
        workspacePath: os.tmpdir(),
        logger: getVoidLogger(),
        logStream: new PassThrough(),
        output: jest.fn(),
        createTemporaryDirectory: jest.fn()
    }

    it('should throw unauthorized error', async()=>{
        await expect(action.handler({
                ...mockContext,
                input: {
                    baseUrl: 'http://localhost:9000',
                    token: 'abcdef',
                    username: '',
                    password: '',
                    name: 'test-project',
                    key: 'test-project',
                    branch: '',
                    visibility: ''
                }
            }
        )).rejects.toThrow(Error('Failed to create SonarQube project, status 401: Unauthorized, please use a valid token or username and password'));
    });
})