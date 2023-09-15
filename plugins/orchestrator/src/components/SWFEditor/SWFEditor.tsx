import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { configApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';

import {
  ChannelType,
  EditorEnvelopeLocator,
  EnvelopeContentType,
  EnvelopeMapping,
} from '@kie-tools-core/editor/dist/api';
import {
  EmbeddedEditorFile,
  StateControl,
} from '@kie-tools-core/editor/dist/channel';
import {
  EmbeddedEditor,
  EmbeddedEditorChannelApiImpl,
  useEditorRef,
} from '@kie-tools-core/editor/dist/embedded';
import { MessageBusClientApi } from '@kie-tools-core/envelope-bus/dist/api';
import { Notification } from '@kie-tools-core/notifications/dist/api';
import {
  PromiseStateWrapper,
  usePromiseState,
} from '@kie-tools-core/react-hooks/dist/PromiseState';
import { useCancelableEffect } from '@kie-tools-core/react-hooks/dist/useCancelableEffect';
import { ServerlessWorkflowCombinedEditorChannelApi } from '@kie-tools/serverless-workflow-combined-editor/dist/api';
import { ServerlessWorkflowCombinedEditorEnvelopeApi } from '@kie-tools/serverless-workflow-combined-editor/dist/api/ServerlessWorkflowCombinedEditorEnvelopeApi';
import { SwfCombinedEditorChannelApiImpl } from '@kie-tools/serverless-workflow-combined-editor/dist/impl/SwfCombinedEditorChannelApiImpl';
import { SwfPreviewOptionsChannelApiImpl } from '@kie-tools/serverless-workflow-combined-editor/dist/impl/SwfPreviewOptionsChannelApiImpl';
import {
  SwfCatalogSourceType,
  SwfServiceCatalogService,
} from '@kie-tools/serverless-workflow-service-catalog/dist/api';
import { parseApiContent } from '@kie-tools/serverless-workflow-service-catalog/dist/channel';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-types';

import {
  empty_definition,
  extractWorkflowFormatFromUri,
  ProcessInstance,
  SwfItem,
  toWorkflowString,
  WorkflowFormat,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { swfApiRef } from '../../api';
import { definitionsRouteRef, editWorkflowRouteRef } from '../../routes';
import { SwfLanguageService } from './channel/SwfLanguageService';
import { SwfLanguageServiceChannelApiImpl } from './channel/SwfLanguageServiceChannelApiImpl';

export enum EditorViewKind {
  AUTHORING = 'AUTHORING',
  DIAGRAM_VIEWER = 'DIAGRAM_VIEWER',
  EXTENDED_DIAGRAM_VIEWER = 'EXTENDED_DIAGRAM_VIEWER',
  RUNTIME = 'RUNTIME',
}

export interface SWFEditorRef {
  validate: () => Promise<Notification[]>;
  getContent: () => Promise<string | undefined>;
  swfItem: SwfItem | undefined;
  isReady: boolean;
}

const LOCALE = 'en';

const NODE_COLORS = {
  error: '#f4d5d5',
  success: '#d5f4e6',
};

export type SwfEditorView =
  | { kind: EditorViewKind.AUTHORING }
  | { kind: EditorViewKind.DIAGRAM_VIEWER }
  | { kind: EditorViewKind.EXTENDED_DIAGRAM_VIEWER }
  | { kind: EditorViewKind.RUNTIME; processInstance: ProcessInstance };

type SWFEditorProps = {
  swfId: string | undefined;
  format?: WorkflowFormat;
} & SwfEditorView;

const RefForwardingSWFEditor: ForwardRefRenderFunction<
  SWFEditorRef,
  SWFEditorProps
> = (props, forwardedRef) => {
  const swfApi = useApi(swfApiRef);
  const configApi = useApi(configApiRef);
  const contextPath = configApi.getString('swf.editor.path');
  const { swfId, kind, format } = props;
  const { editor, editorRef } = useEditorRef();
  const [embeddedFile, setEmbeddedFile] = useState<EmbeddedEditorFile>();
  const [swfItemPromise, setSwfItemPromise] = usePromiseState<SwfItem>();
  const [catalogServices, setCatalogServices] = useState<
    SwfServiceCatalogService[]
  >([]);
  const [canRender, setCanRender] = useState(false);
  const [isReady, setReady] = useState(false);
  const navigate = useNavigate();
  const editWorkflowLink = useRouteRef(editWorkflowRouteRef);
  const viewWorkflowLink = useRouteRef(definitionsRouteRef);

  const currentProcessInstance = useMemo(() => {
    if (kind !== EditorViewKind.RUNTIME) {
      return undefined;
    }
    return props.processInstance;
  }, [props, kind]);

  const envelopeLocator = useMemo(
    () =>
      new EditorEnvelopeLocator(window.location.origin, [
        new EnvelopeMapping({
          type: 'swf',
          filePathGlob: '**/*.sw.+(json|yml|yaml)',
          resourcesPathPrefix: contextPath,
          envelopeContent: {
            type: EnvelopeContentType.PATH,
            path: `${contextPath}/serverless-workflow-combined-editor-envelope.html`,
          },
        }),
      ]),
    [contextPath],
  );

  const stateControl = useMemo(() => new StateControl(), []);

  const languageService = useMemo(() => {
    if (!embeddedFile) {
      return undefined;
    }
    const swfLanguageService = new SwfLanguageService(catalogServices);
    return swfLanguageService.getLs(embeddedFile.path!);
  }, [embeddedFile, catalogServices]);

  const colorNodes = useCallback(
    (processInstance: ProcessInstance) => {
      if (!editor) {
        return undefined;
      }

      const combinedEditorChannelApi = editor.getEnvelopeServer()
        .envelopeApi as unknown as MessageBusClientApi<ServerlessWorkflowCombinedEditorChannelApi>;

      const subscription =
        combinedEditorChannelApi.notifications.kogitoSwfCombinedEditor_combinedEditorReady.subscribe(
          () => {
            const combinedEditorEnvelopeApi = editor.getEnvelopeServer()
              .envelopeApi as unknown as MessageBusClientApi<ServerlessWorkflowCombinedEditorEnvelopeApi>;

            const colorConnectedEnds = !!processInstance.nodes.find(
              node => node.name === 'End',
            );

            const errorNodeDefinitionId =
              processInstance.error?.nodeDefinitionId;

            let errorNodesNames: string[] = [];
            if (errorNodeDefinitionId) {
              errorNodesNames = processInstance.nodes
                .filter(
                  node =>
                    node.definitionId === errorNodeDefinitionId || !node.exit,
                )
                .map(node => node.name);

              if (errorNodesNames.length) {
                combinedEditorEnvelopeApi.notifications.kogitoSwfCombinedEditor_colorNodes.send(
                  {
                    nodeNames: errorNodesNames,
                    color: NODE_COLORS.error,
                    colorConnectedEnds,
                  },
                );
              }
            }

            const successNodeNames = processInstance.nodes
              .filter(node => node.exit && !errorNodesNames.includes(node.name))
              .map(node => node.name);

            if (successNodeNames) {
              combinedEditorEnvelopeApi.notifications.kogitoSwfCombinedEditor_colorNodes.send(
                {
                  nodeNames: successNodeNames,
                  color: NODE_COLORS.success,
                  colorConnectedEnds,
                },
              );
            }
          },
        );

      return () => {
        combinedEditorChannelApi.notifications.kogitoSwfCombinedEditor_combinedEditorReady.unsubscribe(
          subscription,
        );
      };
    },
    [editor],
  );

  const validate = useCallback(async () => {
    if (!editor || !languageService || !embeddedFile) {
      return [];
    }

    const content = await editor.getContent();
    const lsDiagnostics = await languageService.getDiagnostics({
      content: content,
      uriPath: embeddedFile.path!,
    });

    return lsDiagnostics.map(
      (lsDiagnostic: Diagnostic) =>
        ({
          path: '', // empty to not group them by path, as we're only validating one file.
          severity:
            lsDiagnostic.severity === DiagnosticSeverity.Error
              ? 'ERROR'
              : 'WARNING',
          message: `${lsDiagnostic.message} [Line ${
            lsDiagnostic.range.start.line + 1
          }]`,
          type: 'PROBLEM',
          position: {
            startLineNumber: lsDiagnostic.range.start.line + 1,
            startColumn: lsDiagnostic.range.start.character + 1,
            endLineNumber: lsDiagnostic.range.end.line + 1,
            endColumn: lsDiagnostic.range.end.character + 1,
          },
        }) as Notification,
    );
  }, [editor, embeddedFile, languageService]);

  const getContent = useCallback(async () => editor?.getContent(), [editor]);

  const customEditorApi = useMemo(() => {
    if (!embeddedFile || !languageService) {
      return undefined;
    }

    const defaultApiImpl = new EmbeddedEditorChannelApiImpl(
      stateControl,
      embeddedFile,
      LOCALE,
      {
        kogitoEditor_ready: () => {
          setReady(true);
        },
      },
    );

    const swfLanguageServiceChannelApiImpl =
      new SwfLanguageServiceChannelApiImpl(languageService);

    const swfPreviewOptionsChannelApiImpl = new SwfPreviewOptionsChannelApiImpl(
      {
        editorMode: 'full',
        defaultWidth: kind === EditorViewKind.AUTHORING ? '50%' : '100%',
      },
    );

    return new SwfCombinedEditorChannelApiImpl(
      defaultApiImpl,
      undefined,
      swfLanguageServiceChannelApiImpl,
      swfPreviewOptionsChannelApiImpl,
    );
  }, [embeddedFile, languageService, stateControl, kind]);

  useEffect(() => {
    if (!isReady || !currentProcessInstance) {
      return;
    }
    colorNodes(currentProcessInstance);
  }, [colorNodes, currentProcessInstance, isReady]);

  useImperativeHandle(
    forwardedRef,
    () => {
      return {
        validate,
        getContent,
        swfItem: swfItemPromise.data,
        isReady,
      };
    },
    [validate, getContent, swfItemPromise.data, isReady],
  );

  useCancelableEffect(
    useCallback(
      ({ canceled }) => {
        setCanRender(false);

        if (!format && !swfId) {
          setSwfItemPromise({ error: 'Either format or swfId is required' });
          return;
        }

        const promise = swfId
          ? swfApi.getSwf(swfId)
          : Promise.resolve({
              uri: `workflow.sw.${format ?? 'yaml'}`,
              definition: empty_definition,
            } as SwfItem);

        promise
          .then(item => {
            if (canceled.get()) {
              return;
            }

            setSwfItemPromise({ data: item });

            const workflowFormat = extractWorkflowFormatFromUri(item.uri);
            const uriParts = item.uri.split('/');
            const fileName = uriParts[uriParts.length - 1];
            const fileNameParts = fileName.split('.');
            const fileExtension = fileNameParts[fileNameParts.length - 1];

            if (format && swfId && format !== workflowFormat) {
              const link =
                kind === EditorViewKind.AUTHORING
                  ? editWorkflowLink({ swfId, format: fileExtension })
                  : viewWorkflowLink({ swfId, format: fileExtension });

              navigate(link, { replace: true });

              return;
            }

            setEmbeddedFile({
              path: item.uri,
              getFileContents: async () =>
                toWorkflowString(item.definition, workflowFormat),
              isReadOnly: kind !== EditorViewKind.AUTHORING,
              fileExtension,
              fileName,
            });

            setCanRender(true);
          })
          .catch(e => {
            setSwfItemPromise({ error: e });
          });
      },
      [
        format,
        swfId,
        swfApi,
        setSwfItemPromise,
        kind,
        editWorkflowLink,
        viewWorkflowLink,
        navigate,
      ],
    ),
  );

  useCancelableEffect(
    useCallback(
      ({ canceled }) => {
        if (kind !== EditorViewKind.AUTHORING) {
          return;
        }

        swfApi.getSpecs().then(specFiles => {
          if (canceled.get()) {
            return;
          }

          const services = specFiles.map(specFile => {
            const parts = specFile.path.split('/');
            const filename = parts[parts.length - 1];
            return parseApiContent({
              serviceFileContent: JSON.stringify(specFile.content),
              serviceFileName: filename,
              source: {
                type: SwfCatalogSourceType.LOCAL_FS,
                absoluteFilePath: specFile.path,
              },
            });
          });

          setCatalogServices(services);
        });
      },
      [kind, swfApi],
    ),
  );

  return (
    <PromiseStateWrapper
      promise={swfItemPromise}
      resolved={swfItem =>
        canRender &&
        embeddedFile && (
          <EmbeddedEditor
            key={currentProcessInstance?.id ?? swfItem.definition.id}
            ref={editorRef}
            file={embeddedFile}
            channelType={ChannelType.ONLINE}
            editorEnvelopeLocator={envelopeLocator}
            customChannelApiImpl={customEditorApi}
            stateControl={stateControl}
            locale={LOCALE}
            isReady={isReady}
          />
        )
      }
    />
  );
};

export const SWFEditor = forwardRef(RefForwardingSWFEditor);
