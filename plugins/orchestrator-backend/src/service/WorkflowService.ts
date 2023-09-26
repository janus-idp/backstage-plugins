import { Config } from '@backstage/config';

import fs from 'fs-extra';
import { Logger } from 'winston';

import {
  actions_open_api_file_path,
  default_workflows_path,
  extractWorkflowFormatFromUri,
  fromWorkflowSource,
  schemas_folder,
  spec_files,
  toWorkflowString,
  WorkflowItem,
  WorkflowSpecFile,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { extname, join, resolve } from 'path';

import { DataInputSchemaService } from './DataInputSchemaService';
import { GitService } from './GitService';
import { OpenApiService } from './OpenApiService';

export class WorkflowService {
  private readonly openApiService: OpenApiService;
  private readonly dataInputSchemaService: DataInputSchemaService;
  private readonly sonataFlowResourcesPath: string;
  private readonly logger: Logger;
  private readonly githubService: GitService;
  private readonly repoURL: string;
  private readonly autoPush: boolean;
  constructor(
    openApiService: OpenApiService,
    dataInputSchemaService: DataInputSchemaService,
    sonataFlowResourcesPath: string,
    config: Config,
    logger: Logger,
  ) {
    this.openApiService = openApiService;
    this.dataInputSchemaService = dataInputSchemaService;
    this.sonataFlowResourcesPath = sonataFlowResourcesPath;
    this.logger = logger;
    this.githubService = new GitService(logger, config);
    this.repoURL = config.getString(
      'orchestrator.sonataFlowService.workflowsSource.gitRepositoryUrl',
    );
    this.autoPush =
      config.getOptionalBoolean(
        'orchestrator.sonataFlowService.workflowsSource.autoPush',
      ) ?? false;
  }

  async saveWorkflowDefinition(item: WorkflowItem): Promise<WorkflowItem> {
    const workflowFormat = extractWorkflowFormatFromUri(item.uri);
    const definitionsPath = this.resolveResourcePath(
      `${item.definition.id}.sw.${workflowFormat}`,
    );
    const dataInputSchemaPath = await this.saveDataInputSchema(item);
    if (dataInputSchemaPath) {
      item.definition.dataInputSchema = dataInputSchemaPath;
    }

    await this.saveFile(definitionsPath, item.definition);

    if (this.autoPush) {
      await this.githubService.push(
        this.sonataFlowResourcesPath,
        `new workflow changes ${definitionsPath}`,
      );
    }

    return item;
  }

  private async saveFile(path: string, data: any): Promise<void> {
    this.logger.info(`Saving file ${path}`);
    const fileExtension = extname(path);
    const isWorkflow = /\.sw\.(json|yaml|yml)$/.test(path);
    let contentToSave;
    if (isWorkflow) {
      contentToSave = toWorkflowString(
        data,
        fileExtension === '.json' ? 'json' : 'yaml',
      );
    } else if (fileExtension === '.json') {
      contentToSave = JSON.stringify(data, null, 2);
    } else {
      contentToSave = data;
    }
    await fs.writeFile(path, contentToSave, 'utf8');
  }

  async saveWorkflowDefinitionFromUrl(url: string): Promise<WorkflowItem> {
    const workflow = await this.fetchWorkflowDefinitionFromUrl(url);
    await this.saveWorkflowDefinition(workflow);
    return workflow;
  }

  async fetchWorkflowDefinitionFromUrl(url: string): Promise<WorkflowItem> {
    const response = await fetch(url);
    const content = await response.text();
    const definition = fromWorkflowSource(content);
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    return {
      uri: fileName,
      definition,
    };
  }

  async saveOpenApi(): Promise<void> {
    const path = this.resolveResourcePath(actions_open_api_file_path);
    const openApi = await this.openApiService.generateOpenApi();
    if (!openApi) {
      return;
    }
    await this.saveFile(path, openApi);

    if (this.autoPush) {
      await this.githubService.push(
        this.sonataFlowResourcesPath,
        `new openapi changes ${path}`,
      );
    }
  }

  async saveDataInputSchema(
    workflowItem: WorkflowItem,
  ): Promise<string | undefined> {
    const openApi = await this.openApiService.generateOpenApi();
    const dataInputSchema = await this.dataInputSchemaService.generate({
      definition: workflowItem.definition,
      openApi,
    });

    if (!dataInputSchema) {
      return undefined;
    }

    const workflowDataInputSchemaPath = join(
      schemas_folder,
      dataInputSchema.compositionSchema.fileName,
    );

    dataInputSchema.compositionSchema.jsonSchema = {
      $id: `classpath:/${workflowDataInputSchemaPath}`,
      ...dataInputSchema.compositionSchema.jsonSchema,
    };

    dataInputSchema.actionSchemas.forEach(actionSchema => {
      actionSchema.jsonSchema = {
        $id: `classpath:/${schemas_folder}/${actionSchema.fileName}`,
        ...actionSchema.jsonSchema,
      };
    });

    const schemaFiles = [
      dataInputSchema.compositionSchema,
      ...dataInputSchema.actionSchemas,
    ];

    const saveSchemaPromises = schemaFiles.map(schemaFile => {
      const path = this.resolveResourcePath(
        join(schemas_folder, schemaFile.fileName),
      );
      return this.saveFile(path, schemaFile.jsonSchema);
    });

    await Promise.all(saveSchemaPromises);

    return workflowDataInputSchemaPath;
  }

  async deleteWorkflowDefinitionById(uri: string): Promise<void> {
    const definitionsPath = this.resolveResourcePath(uri);
    await fs.rm(definitionsPath, { force: true });
  }

  async listStoredSpecs(): Promise<WorkflowSpecFile[]> {
    const specs: WorkflowSpecFile[] = [];
    // We can list all spec files from FS but let's keep it simple for now
    for (const relativePath of spec_files) {
      const path = this.resolveResourcePath(relativePath);
      const buffer = await fs.readFile(path);
      const content = JSON.parse(buffer.toString('utf8'));
      specs.push({ path, content });
    }
    return specs;
  }

  private resolveResourcePath(relativePath: string): string {
    return resolve(
      join(this.sonataFlowResourcesPath, default_workflows_path, relativePath),
    );
  }
  async reloadWorkflows() {
    this.logger.info(`Reloading workflows from Git`);
    const localPath = this.sonataFlowResourcesPath;
    await fs.remove(localPath);
    await this.githubService.clone(this.repoURL, localPath);
  }
}
