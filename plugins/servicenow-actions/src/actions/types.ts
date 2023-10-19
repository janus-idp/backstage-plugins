import type { Config } from '@backstage/config';
import type { JsonObject } from '@backstage/types';

export type CreateActionOptions = {
  config: Config;
};

export type ServiceNowResponses = {
  200:
    | {
        result: JsonObject[];
      }
    | undefined;
  201: {
    result: JsonObject[];
  };
  400: {
    error: {
      message: string;
      detail: string | null;
    };
    status: 'failure';
  };
  401: {
    error: {
      message: 'User Not Authenticated';
      detail: 'Required to provide Auth information';
    };
    status: 'failure';
  };
  404: {
    error: {
      message: string;
      detail: string | null;
    };
    status: 'failure';
  };
};

export type ServiceNowResponse = {
  [key in keyof ServiceNowResponses]: ServiceNowResponses[key];
}[keyof ServiceNowResponses];
