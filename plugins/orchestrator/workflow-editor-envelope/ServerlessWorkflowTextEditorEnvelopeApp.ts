import { initCustom } from '@kie-tools-core/editor/dist/envelope';
import {
  ServerlessWorkflowTextEditorApi,
  ServerlessWorkflowTextEditorChannelApi,
  ServerlessWorkflowTextEditorEnvelopeApi,
} from '@kie-tools/serverless-workflow-text-editor/dist/api';
import { ServerlessWorkflowTextEditorFactory } from '@kie-tools/serverless-workflow-text-editor/dist/editor';
import { ServerlessWorkflowTextEditorEnvelopeApiImpl } from '@kie-tools/serverless-workflow-text-editor/dist/envelope';

initCustom<
  ServerlessWorkflowTextEditorApi,
  ServerlessWorkflowTextEditorEnvelopeApi,
  ServerlessWorkflowTextEditorChannelApi
>({
  container: document.getElementById(
    'serverless-workflow-text-editor-envelope-app',
  )!,
  bus: {
    postMessage: (message, targetOrigin, _) =>
      window.parent.postMessage(message, targetOrigin!, _),
  },
  apiImplFactory: {
    create: args =>
      new ServerlessWorkflowTextEditorEnvelopeApiImpl(
        args,
        new ServerlessWorkflowTextEditorFactory(),
      ),
  },
});
