/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { tektonPipelinesPluginPlugin, EntityTektonPipelinesContent } from '../src/plugin';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { TestApiProvider } from '@backstage/test-utils';
import { Label, PipelineRun, PipelineRunsByEntityRequest, TaskRun } from '@jquad-group/plugin-tekton-pipelines-common';
import { TektonApi, tektonApiRef } from '../src/api/types';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'backstage.io/kubernetes-id': 'dice-roller',
      'tektonci/build-namespace': 'sample-go-application-build',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

class MockTektonClient implements TektonApi {

  async getHealth(): Promise<{ status: string; }> {
    return { status: 'ok'};
  }

  async getPipelineRuns(request: PipelineRunsByEntityRequest, baseUrl: string, authorizationBearerToken: string, namespace: string, selector: string, dashboardBaseUrl: string): Promise<PipelineRun[]> {
    const recordMock: Record<string, Label> = {
      "testKey": 
      {key: "test-key", value: "test-value"},
    };
    const taskRunMock1: TaskRun = {
      metadata: {
        name: "taskrun-1",
        namespace: "sample-go-application-build",
        labels: recordMock,
      },
      status: {
        podName: "taskrun-1-pod",
        startTime: new Date("2022-10-25T18:42:30Z"),
        completionTime: new Date("2022-10-25T18:47:30Z"),
        duration: 5,
        durationString: "5m",
        steps: [
          {
            container: "taskrun-container",
            log: "some log",
            name: "taskrun-name",
            terminated: {
              duration: 5,
              durationString: "5m",
              finishedAt: new Date("2022-10-25T18:47:30Z"),
              reason: "Completed",
              startedAt: new Date("2022-10-25T18:42:30Z"),
            },
          },
        ],
        conditions: [
          {                  
              "message": "Tasks Completed: 4 (Failed: 0, Cancelled 0), Skipped: 1",
              "reason": "Completed",
              "status": "True",
              "type": "Succeeded"
          },
        ],   
      }
    }

    const taskRunMock2: TaskRun = {
      metadata: {
        name: "taskrun-2",
        namespace: "sample-go-application-build",
        labels: recordMock,
      },
      status: {
        podName: "taskrun-2-pod",
        startTime: new Date("2022-10-25T18:42:30Z"),
        completionTime: new Date("2022-10-25T18:47:30Z"),
        duration: 5,
        durationString: "5m",
        steps: [
          {
            container: "taskrun-clone",
            log: "clone",
            name: "taskrun-name",
            terminated: {
              duration: 5,
              durationString: "5m",
              finishedAt: new Date("2022-10-25T18:47:30Z"),
              reason: "Completed",
              startedAt: new Date("2022-10-25T18:42:30Z"),
            },
          },
          {
            container: "taskrun-build",
            log: "clone",
            name: "build",
            terminated: {
              duration: 5,
              durationString: "5m",
              finishedAt: new Date("2022-10-25T18:47:30Z"),
              reason: "Completed",
              startedAt: new Date("2022-10-25T18:42:30Z"),
            },
          },
          {
            container: "taskrun-test",
            log: "test",
            name: "test",
            terminated: {
              duration: 5,
              durationString: "5m",
              finishedAt: new Date("2022-10-25T18:47:30Z"),
              reason: "Completed",
              startedAt: new Date("2022-10-25T18:42:30Z"),
            },
          },
        ],
        conditions: [
          {                  
              "message": "Tasks Completed: 4 (Failed: 0, Cancelled 0), Skipped: 1",
              "reason": "Completed",
              "status": "True",
              "type": "Succeeded"
          },
        ],   
      }
    }

    const taskRuns: TaskRun[] = [];
    taskRuns.push(taskRunMock1);
    taskRuns.push(taskRunMock2);
    const pipelineRunMock: PipelineRun = {
          metadata: {
            labels: recordMock,            
            name: "feature-added-catalog-info-xdjk9",
            namespace: "sample-go-application-build",
          },
          pipelineRunDashboardUrl: "https://mock.dashboard",
          taskRuns: taskRuns,
          status: {
            startTime: new Date("2022-10-25T18:42:30Z"),
            completionTime: new Date("2022-10-25T18:47:30Z"),
            duration: 5,
            durationString: "5m",      
            conditions: [
                {                  
                    "message": "Tasks Completed: 4 (Failed: 0, Cancelled 0), Skipped: 1",
                    "reason": "Completed",
                    "status": "True",
                    "type": "Succeeded"
                },
            ],          
          },
    };
    const pipelineRuns: PipelineRun[] = [];
    pipelineRuns.push(pipelineRunMock);
    
    return pipelineRuns;
  }
  
}

createDevApp()
  .registerPlugin(tektonPipelinesPluginPlugin)
  .addPage({
    element: (
    <TestApiProvider
      apis={[[tektonApiRef, new MockTektonClient()]]}
    >
    <EntityProvider entity={mockEntity}>
       <EntityTektonPipelinesContent />
    </EntityProvider>
    </TestApiProvider>
    ),
    title: 'Root Page',
    path: '/tekton-pipelines-plugin'
  })
  .render();
