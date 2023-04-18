// To be used in tests only.
import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  MockConfigApi,
  MockFetchApi,
  TestApiProvider,
} from '@backstage/test-utils';
import { configApiRef, fetchApiRef } from '@backstage/core-plugin-api';

import { useInitializeStore } from './App';

const MOCK_BASE_URL = 'https://example.com';
const MOCK_CONTEXT_URL = 'api/proxy/parodos';

const TestAppStore: React.FC = ({ children }) => {
  useInitializeStore();
  return <>{children}</>;
};

// To be used in tests only.
export const TestApp: React.FC = ({ children }) => {
  const mockConfig = new MockConfigApi({
    backend: { baseUrl: MOCK_BASE_URL },
  });
  const mockFetch = new MockFetchApi({
    baseImplementation: (
      input: RequestInfo | URL,
      // init?: RequestInit,
    ): Promise<Response> => {
      // TODO: The test case should pass the mocks as props to the component
      if (input === `${MOCK_BASE_URL}/${MOCK_CONTEXT_URL}/projects`) {
        return new Promise(resolve => {
          resolve(
            new Response(
              JSON.stringify([
                {
                  id: '511da8ce-4df7-438b-a9ec-0130f14884bd',
                  name: 'myProject',
                  description: 'My descrition',
                  createDate: '2023-04-14T07:55:38.144+00:00',
                  modifyDate: '2023-04-14T07:55:38.144+00:00',
                  username: 'test',
                },
              ]),
            ),
          );
        });
      }

      if (
        input === `${MOCK_BASE_URL}/${MOCK_CONTEXT_URL}/workflowdefinitions`
      ) {
        return new Promise(resolve => {
          resolve(new Response(JSON.stringify([])));
        });
      }

      return new Promise((_, reject) => {
        reject(new Error(`Not mocked: ${input}`));
      });
    },
  });

  return (
    <TestApiProvider
      apis={[
        [configApiRef, mockConfig],
        [fetchApiRef, mockFetch],
      ]}
    >
      <TestAppStore>{children}</TestAppStore>
    </TestApiProvider>
  );
};
