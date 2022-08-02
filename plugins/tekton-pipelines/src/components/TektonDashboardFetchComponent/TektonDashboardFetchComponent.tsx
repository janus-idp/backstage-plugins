/*
curl -s https://rancher.jquad.rocks/apis/tekton.dev/v1beta1/namespaces/sample-go-aplication-build/pipelineruns --header "Authorization: Bearer token-ms7t6:lwsftplxxrll7wq4fnl5fl5t42l7pxfp2rnggr62cg4ml7ds5ckbh2" -v
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
import { Table, TableColumn, Progress, StatusError, StatusOK, StatusPending, StatusRunning, StatusWarning } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import useAsync from 'react-use/lib/useAsync';
import { Typography, Box} from '@material-ui/core';
import { configApiRef, useApi } from '@backstage/core-plugin-api'
import { useEntity } from '@backstage/plugin-catalog-react'

interface PipelineRun {
  metadata: {
    name: string; 
    namespace: string; 
    labels: Array<string>;
  }
  status: {
    conditions: [
      Condition
    ]
  }
}

interface Condition {
reason: string;
type: string;
status: string;
message: string;
}

type DenseTableProps = {
  pipelineruns: PipelineRun[];
};


export const TEKTON_PIPELINES_BUILD_NAMESPACE = 'tektonci/build-namespace';
export const TEKTON_PIPELINES_LABEL_SELECTOR = "tektonci/pipeline-label-selector";

function getStatusComponent(status: string | undefined = '') {
    if (status == 'Created') {
      return <StatusPending />;
    } else
    if (status == 'Running') {
      return <StatusRunning />;
    } else
    if (status == 'Completed') {
      return <StatusOK />;
    } else
    if (status == 'Succeeded') {
      return <StatusOK />;
    } else
    if (status == 'PipelineRunCancelled') {
      return <StatusWarning />;
    } else
    if (status == 'Failed') {
      return <StatusError />;      
    } else {
      return <StatusPending />;
    }

};


export const DenseTable = ({ pipelineruns }: DenseTableProps) => {

  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    { title: 'Namespace', field: 'namespace' },
    { title: 'Status', field: 'status',
    render: (condition: Partial<Condition>) => (
      <Box display="flex" alignItems="center">
        {getStatusComponent(condition.status)}
        <Box mr={1} />
        <Typography variant="button">{condition.status}</Typography>
      </Box>
    ),
    },   
  ];

  const data = pipelineruns.map(pipelinerun => {
    return {
      name: pipelinerun.metadata.name,
      namespace: pipelinerun.metadata.namespace,
      status: pipelinerun.status.conditions.map(condition => condition.reason),
    };
  });

  
  return (
    <Table
      title="List of PipelineRun resources"
      options={{ search: false, paging: true }}
      columns={columns}
      data={data}
    />    
  );
  
  
};

export const TektonDashboardFetchComponent = () => {
  const config = useApi(configApiRef)
  const { entity } = useEntity();
  const tektonBuildNamespace = entity?.metadata.annotations?.[TEKTON_PIPELINES_BUILD_NAMESPACE] ?? '';
  const tektonLabelSelector = entity?.metadata.annotations?.[TEKTON_PIPELINES_LABEL_SELECTOR] ?? '';
  if (!tektonBuildNamespace) {
    throw new Error("The field 'metadata.annotations.tektonci/build-namespace' is missing.");
  }

  const backendUrl = config.getString('backend.baseUrl')

  const { value, loading, error } = useAsync(async (): Promise<PipelineRun[]> => {
    const response = await fetch(`${backendUrl}/api/tekton/pipelineruns?namespace=${tektonBuildNamespace}&selector=${tektonLabelSelector}`, {                                  
      headers: new Headers({
        'Accept': 'application/json'
    })    

    } 
  );
    const data = await response.json();
    return data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return <DenseTable pipelineruns={value || []} />;
};
