/* Config Data */
import anonymousAuth from './general/auth_info_anonymous.json';
import configData from './general/config.json';
import istioCertsInfo from './general/istioCertsInfo.json';
import istioConfig from './general/istioConfig.json';
import istioStatus from './general/istioStatus.json';
import istioValidations from './general/istioValidations.json';
import meshCanaryStatus from './general/meshCanaryStatus.json';
import meshIstioResourceThresholds from './general/meshIstioResurceThresholds.json';
import meshTls from './general/meshTls.json';
import namespacesData from './general/namespaces.json';
import outboundTrafficPolicy from './general/outbound_traffic_policy_mode.json';
import status from './general/status.json';
/** health **/

import bookinfoHealthApp from './namespaces/bookinfo/health/app.json';
import bookinfoHealthService from './namespaces/bookinfo/health/service.json';
import bookinfoHealthWorkload from './namespaces/bookinfo/health/workload.json';
import bookInfoMetrics from './namespaces/bookinfo/metrics';
/* bookinfo */
import bookinfoTls from './namespaces/bookinfo/tls.json';
/** Workloads **/
import bookinfoWorkloads from './namespaces/bookinfo/workloads.json';
/**   health  **/
import istioSystemHealthApp from './namespaces/istio-system/health/app.json';
import istioSystemHealthService from './namespaces/istio-system/health/service.json';
import istioSystemHealthWorkload from './namespaces/istio-system/health/workload.json';
import istioSystemMetrics from './namespaces/istio-system/metrics';
/* istio-system */
import istioSystemTls from './namespaces/istio-system/tls.json';
import istioSystemWorkloads from './namespaces/istio-system/workloads.json';
/** health **/

import travelAgencyHealthApp from './namespaces/travel-agency/health/app.json';
import travelAgencyHealthService from './namespaces/travel-agency/health/service.json';
import travelAgencyHealthWorkload from './namespaces/travel-agency/health/workload.json';
import travelAgencyMetrics from './namespaces/travel-agency/metrics';
/* Travel agency */
import travelAgencyTls from './namespaces/travel-agency/tls.json';
import travelAgencyWorkloads from './namespaces/travel-agency/workloads.json';
/** health **/

import travelControlHealthApp from './namespaces/travel-control/health/app.json';
import travelControlHealthService from './namespaces/travel-control/health/service.json';
import travelControlHealthWorkload from './namespaces/travel-control/health/workload.json';
import travelControlMetrics from './namespaces/travel-control/metrics';
/* Travel control */
import travelControlTls from './namespaces/travel-control/tls.json';
import travelControlWorkloads from './namespaces/travel-control/workloads.json';
/** health **/

import travelPortalHealthApp from './namespaces/travel-portal/health/app.json';
import travelPortalHealthService from './namespaces/travel-portal/health/service.json';
import travelPortalHealthWorkload from './namespaces/travel-portal/health/workload.json';
import travelPortalMetrics from './namespaces/travel-portal/metrics';
/* Travel portal */
import travelPortalTls from './namespaces/travel-portal/tls.json';
import travelPortalWorkloads from './namespaces/travel-portal/workloads.json';

export const kialiData: { [index: string]: any } = {
  auth: anonymousAuth,
  config: configData,
  namespaces: namespacesData,
  meshTls: meshTls,
  meshCanaryStatus: meshCanaryStatus,
  meshIstioResourceThresholds: meshIstioResourceThresholds,
  outboundTrafficPolicy: outboundTrafficPolicy,
  istioValidations: istioValidations,
  istioConfig: istioConfig,
  istioStatus: istioStatus,
  istioCertsInfo: istioCertsInfo,
  namespacesData: {
    'istio-system': {
      tls: istioSystemTls,
      metrics: istioSystemMetrics,
      health: {
        app: istioSystemHealthApp,
        service: istioSystemHealthService,
        workload: istioSystemHealthWorkload,
      },
    },
    bookinfo: {
      tls: bookinfoTls,
      metrics: bookInfoMetrics,
      health: {
        app: bookinfoHealthApp,
        service: bookinfoHealthService,
        workload: bookinfoHealthWorkload,
      },
    },
    'travel-control': {
      tls: travelControlTls,
      metrics: travelControlMetrics,
      health: {
        app: travelControlHealthApp,
        service: travelControlHealthService,
        workload: travelControlHealthWorkload,
      },
    },
    'travel-portal': {
      tls: travelPortalTls,
      metrics: travelPortalMetrics,
      health: {
        app: travelPortalHealthApp,
        service: travelPortalHealthService,
        workload: travelPortalHealthWorkload,
      },
    },
    'travel-agency': {
      tls: travelAgencyTls,
      metrics: travelAgencyMetrics,
      health: {
        app: travelAgencyHealthApp,
        service: travelAgencyHealthService,
        workload: travelAgencyHealthWorkload,
      },
    },
  },
  workloads: {
    'istio-system': istioSystemWorkloads,
    bookinfo: bookinfoWorkloads,
    'travel-portal': travelPortalWorkloads,
    'travel-agency': travelAgencyWorkloads,
    'travel-control': travelControlWorkloads,
  },
  status: status,
};
