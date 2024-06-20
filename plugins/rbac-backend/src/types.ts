import { Source } from '@janus-idp/backstage-plugin-rbac-common';

export type SourcedPolicy = {
  policy: string[];
  source: Source;
};
