import { Config } from '@backstage/config';

import fs from 'fs-extra';
import { Logger } from 'winston';

import { GitService } from './GitService';
import { SonataFlowService } from './SonataFlowService';

export class WorkflowService {
  private readonly sonataFlowService: SonataFlowService;
  private readonly logger: Logger;
  private readonly githubService: GitService;
  private readonly repoURL: string;
  constructor(
    sonataFlowService: SonataFlowService,
    config: Config,
    logger: Logger,
  ) {
    this.sonataFlowService = sonataFlowService;
    this.logger = logger;
    this.githubService = new GitService(logger, config);
    this.repoURL =
      config.getOptionalString(
        'orchestrator.sonataFlowService.workflowsSource.gitRepositoryUrl',
      ) ?? '';
  }

  async reloadWorkflows() {
    if (!this.repoURL) {
      this.logger.info('No Git repository configured. Skipping reload.');
      return;
    }

    this.logger.info('Reloading workflows from Git');
    const localPath = this.sonataFlowService.resourcesPath;
    if (await fs.pathExists(localPath)) {
      this.logger.info(`Path ${localPath} already exists. Skipping clone.`);
      return;
    }

    await fs.remove(localPath);
    await this.githubService.clone(this.repoURL, localPath);
  }
}
