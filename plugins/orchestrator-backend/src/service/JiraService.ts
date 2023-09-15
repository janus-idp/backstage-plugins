import { CloudEvent } from 'cloudevents';
import { Logger } from 'winston';

import { CloudEventService } from './CloudEventService';

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

export type IssueEvent = IssueCommented | IssueUpdated;

export type JiraEvent = IssueEvent;

export class JiraService {
  constructor(
    private readonly logger: Logger,
    private readonly cloudEventService: CloudEventService,
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
      if (newStatus === 'Done' || newStatus === 'Resolved') {
        const response = await this.cloudEventService.send({
          event: new CloudEvent({
            type: 'jira_webhook_callback', // same defined in the workflow
            source: 'jira',
            kogitoprocrefid: workflowInstanceId, // correlation
            data: jiraEvent,
          }),
        });

        if (!response.success) {
          this.logger.error(`Failed to send cloud event: ${response.error}`);
        }
      }
    }
  }
}
