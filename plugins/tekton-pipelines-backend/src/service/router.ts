import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { Config } from '@backstage/config'
import { getMicroservicePipelineRuns, getLogs } from './pipelinerun';
/* ignore lint error for internal dependencies */
/* eslint-disable */
import { Cluster } from '@jquad-group/plugin-tekton-pipelines-common';
/* eslint-enable */
export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());

  logger.info('Initializing tekton backend')
  const tektonConfig: Config[] = config.getConfigArray('tekton')
    router.get('/pipelineruns', async (request, response) => {
      
      const namespace: any = request.query.namespace
      const selector: any = request.query.selector
      const result: Cluster[] = []

      for(const currentConfig of tektonConfig) { 
               
        const name: string = currentConfig.getString('name')
        const baseUrl: string = currentConfig.getString('baseUrl')
        let authorizationBearerToken: string = ""
        if (currentConfig.getOptionalString('authorizationBearerToken') !== undefined) {
            authorizationBearerToken = currentConfig.getString('authorizationBearerToken')
        }
        const dashboardBaseUrl: string = currentConfig.getString('dashboardBaseUrl')
        
        let cluster; 
        const tempCluster = {} as Cluster
        let errStr: string;
        try {
          cluster = await getMicroservicePipelineRuns(
          name,
          baseUrl,
          authorizationBearerToken,
          namespace,
          selector,
          dashboardBaseUrl,          
        ) 
        result.push(cluster)  
        } catch (error) {
          if (error instanceof Error) {
              errStr = error.message
              tempCluster.name = name
              tempCluster.pipelineRuns = []
              tempCluster.error = errStr
              console.log(errStr)                
              console.log(tempCluster.error)
              result.push(tempCluster)
          } 
        }        
      }
      response.send(result)
    })

    router.get('/logs', async (request, response) => {
      
      const namespace: any = request.query.namespace
      const taskRunPodName: any = request.query.taskRunPodName
      const stepContainer: any = request.query.stepContainer
      const clusterName: any = request.query.clusterName

      for(const currentConfig of tektonConfig) { 

        if (currentConfig.getString('name') === clusterName) {
          const baseUrl: string = currentConfig.getString('baseUrl')

          let authorizationBearerToken: string = ""
          if (currentConfig.getOptionalString('authorizationBearerToken') !== undefined) {
              authorizationBearerToken = currentConfig.getString('authorizationBearerToken')
          }

          const logs = await getLogs(
            baseUrl,
            authorizationBearerToken,
            namespace,
            taskRunPodName,
            stepContainer,
          )

          response.send(logs)
        } 
      }      
    })    
  
  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.send({ status: 'ok' });
  });
  router.use(errorHandler());
  return router;
}
