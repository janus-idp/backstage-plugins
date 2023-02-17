import { getVoidLogger } from '@backstage/backend-common'
import { ConfigReader } from '@backstage/config'
import express from 'express'
import request from 'supertest'
import { createRouter } from './router'

describe('createRouter', () => {
  let app: express.Express

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config: new ConfigReader({
        tekton: [{
          baseUrl: 'k8s.com',
          authorizationBearerToken: 'foo',
          dashboardBaseUrl: 'dashboard.com'
        }],
      }),
    })
    app = express().use(router)
  })

  // https://github.com/backstage/backstage/blob/13bdc545117678870a5f4733f34af07c90565e73/plugins/azure-devops-backend/src/service/router.test.ts#L107
  
  describe('GET /pipelineruns', () => {
    it('return project info', async () => {
      const namespace = "sample-go-application-build"
      const response = await request(app)
        .get('/pipelineruns')
        .query({ namespace: namespace })

      expect(response.statusType).toEqual(5)
      
    }, 10000)
    
  })
 
})
