import { Entity } from '@backstage/catalog-model';

export const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'example-website-for-feedback-plugin',
    title: 'Example App',
    namespace: 'default',
    annotations: {
      'feedback/type': 'JIRA',
      'feedback/email-to': 'example@email.com',
    },
    spec: {
      owner: 'guest',
      type: 'service',
      lifecycle: 'production',
    },
  },
};
