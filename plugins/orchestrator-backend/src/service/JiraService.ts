import { CloudEvent } from 'cloudevents';
import { Logger } from 'winston';

import { CloudEventService } from './CloudEventService';
import { DataIndexService } from './DataIndexService';

export interface BaseIssueEvent {
  webhookEvent: 'jira:issue_updated';
  issue: {
    id: string;
    key: string;
    fields: {
      labels: string[];
    };
  };
}

export interface IssueCommented extends BaseIssueEvent {
  issue_event_type_name: 'issue_commented';
  comment: {
    body: string;
  };
}

export interface IssueUpdated extends BaseIssueEvent {
  issue_event_type_name: 'issue_generic' | 'issue_resolved';
  changelog: {
    items: {
      field: string;
      fromString: string;
      toString: string;
    }[];
  };
}

export type JiraEvent = IssueCommented | IssueUpdated;

export class JiraService {
  constructor(
    private readonly logger: Logger,
    private readonly cloudEventService: CloudEventService,
    private readonly dataIndexService: DataIndexService,
  ) {}

  public async handleEvent(jiraEvent: JiraEvent | undefined): Promise<void> {
    if (!jiraEvent) {
      this.logger.warn('Received empty event');
      return;
    }

    if (jiraEvent.issue_event_type_name === 'issue_resolved') {
      const newStatus = jiraEvent.changelog.items.find(
        item => item.field === 'status',
      )?.toString;
      const label = jiraEvent.issue.fields.labels.find(l =>
        l.includes('workflowId'),
      );
      if (!label) {
        this.logger.warn('Received event without JIRA label');
        return;
      }

      const workflowInstanceId = label.slice(label.indexOf('=') + 1);
      const processInstance =
        await this.dataIndexService.fetchInstance(workflowInstanceId);

      if (!processInstance?.serviceUrl) {
        this.logger.warn(
          `Received event for unknown workflow instance ${workflowInstanceId}`,
        );
        return;
      }

      if (newStatus === 'Done' || newStatus === 'Resolved') {
        const response = await this.cloudEventService.send({
          event: new CloudEvent({
            type: 'jira_webhook_callback', // same defined in the workflow
            source: 'jira',
            kogitoprocrefid: workflowInstanceId, // correlation
            data: jiraEvent,
          }),
          targetUrl: processInstance.serviceUrl,
        });

        if (!response.success) {
          this.logger.error(`Failed to send cloud event: ${response.error}`);
        }
      }
    }
  }
}
