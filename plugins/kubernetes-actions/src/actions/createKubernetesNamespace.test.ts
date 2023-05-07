// import { PassThrough } from 'stream';
// import { createKubernetesNamespaceAction } from './createKubernetesNamespace';
// import { getVoidLogger } from '@backstage/backend-common';

// afterEach(() => {
//     describe('kubernetes:create-namespace', () => {
//     jest.resetAllMocks();
//   });

//   it('should call action', async () => {
//     const action = createKubernetesNamespaceAction();

//     const logger = getVoidLogger();
//     jest.spyOn(logger, 'info');

//     await action.handler({
//       input: {
//         : 'test',
//       },
//       workspacePath: '/tmp',
//       logger,
//       logStream: new PassThrough(),
//       output: jest.fn(),
//       createTemporaryDirectory() {
//         // Usage of mock-fs is recommended for testing of filesystem operations
//         throw new Error('Not implemented');
//       },
//     });

//     expect(logger.info).toHaveBeenCalledWith(
//       'Running example template with parameters: test',
//     );
//   });
// });
