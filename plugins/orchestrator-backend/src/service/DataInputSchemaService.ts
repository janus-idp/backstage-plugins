import type { JsonObject } from '@backstage/types';

import { WORKFLOW_DATA_KEY } from './constants';

export class DataInputSchemaService {
  public extractWorkflowData(variables?: object): JsonObject | undefined {
    return variables && WORKFLOW_DATA_KEY in variables
      ? (variables[WORKFLOW_DATA_KEY] as JsonObject)
      : undefined;
  }
}
