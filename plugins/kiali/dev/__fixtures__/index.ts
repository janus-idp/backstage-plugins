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
import bookinfoIstioConfig from './namespaces/bookinfo/istio_config.json';
import bookInfoMetrics from './namespaces/bookinfo/metrics';
/* bookinfo */
import bookinfoTls from './namespaces/bookinfo/tls.json';
/** Workloads **/
import bookinfoWorkloads from './namespaces/bookinfo/workloads.json';
import detailsWorkload from './namespaces/bookinfo/workloads/details_v1.json';
import kialitrafficWorkload from './namespaces/bookinfo/workloads/kiali_traffic_generator.json';
import productpagev1Workload from './namespaces/bookinfo/workloads/productpage_v1.json';
import ratingsv1Workload from './namespaces/bookinfo/workloads/ratings_v1.json';
import reviewsv1Workload from './namespaces/bookinfo/workloads/reviews_v1.json';
import reviewsv2Workload from './namespaces/bookinfo/workloads/reviews_v2.json';
import reviewsv3Workload from './namespaces/bookinfo/workloads/reviews_v3.json';
/**   health  **/
import istioSystemHealthApp from './namespaces/istio-system/health/app.json';
import istioSystemHealthService from './namespaces/istio-system/health/service.json';
import istioSystemHealthWorkload from './namespaces/istio-system/health/workload.json';
import istioSystemIstioConfig from './namespaces/istio-system/istio_config.json';
import istioSystemMetrics from './namespaces/istio-system/metrics';
/* istio-system */
import istioSystemTls from './namespaces/istio-system/tls.json';
import istioSystemWorkloads from './namespaces/istio-system/workloads.json';
import grafanaWorkload from './namespaces/istio-system/workloads/grafana.json';
import istioegressgatewayWorkload from './namespaces/istio-system/workloads/istio_egressgateway.json';
import istioingressgatewayWorkload from './namespaces/istio-system/workloads/istio_ingressgateway.json';
import istiodWorkload from './namespaces/istio-system/workloads/istiod.json';
import jaegerWorkload from './namespaces/istio-system/workloads/jaeger.json';
import kialiWorkload from './namespaces/istio-system/workloads/kiali.json';
import prometheusWorkload from './namespaces/istio-system/workloads/prometheus.json';
/** health **/

import travelAgencyHealthApp from './namespaces/travel-agency/health/app.json';
import travelAgencyHealthService from './namespaces/travel-agency/health/service.json';
import travelAgencyHealthWorkload from './namespaces/travel-agency/health/workload.json';
import travelAgencyIstioConfig from './namespaces/travel-agency/istio_config.json';
import travelAgencyMetrics from './namespaces/travel-agency/metrics';
/* Travel agency */
import travelAgencyTls from './namespaces/travel-agency/tls.json';
import travelAgencyWorkloads from './namespaces/travel-agency/workloads.json';
import carsv1Workload from './namespaces/travel-agency/workloads/cars_v1.json';
import discountsv1Workload from './namespaces/travel-agency/workloads/discounts_v1.json';
import flightsv1Workload from './namespaces/travel-agency/workloads/flights_v1.json';
import hotelsv1Workload from './namespaces/travel-agency/workloads/hotels_v1.json';
import insurancesv1Workload from './namespaces/travel-agency/workloads/insurances_v1.json';
import mysqldbv1Workload from './namespaces/travel-agency/workloads/mysqldb_v1.json';
import travelsv1Workload from './namespaces/travel-agency/workloads/travels_v1.json';
/** health **/

import travelControlHealthApp from './namespaces/travel-control/health/app.json';
import travelControlHealthService from './namespaces/travel-control/health/service.json';
import travelControlHealthWorkload from './namespaces/travel-control/health/workload.json';
import travelControlIstioConfig from './namespaces/travel-control/istio_config.json';
import travelControlMetrics from './namespaces/travel-control/metrics';
/* Travel control */
import travelControlTls from './namespaces/travel-control/tls.json';
import travelControlWorkloads from './namespaces/travel-control/workloads.json';
import travelControlWorkload from './namespaces/travel-control/workloads/control.json';
/** health **/

import travelPortalHealthApp from './namespaces/travel-portal/health/app.json';
import travelPortalHealthService from './namespaces/travel-portal/health/service.json';
import travelPortalHealthWorkload from './namespaces/travel-portal/health/workload.json';
import travelPortalIstioConfig from './namespaces/travel-portal/istio_config.json';
import travelPortalMetrics from './namespaces/travel-portal/metrics';
/* Travel portal */
import travelPortalTls from './namespaces/travel-portal/tls.json';
import travelPortalWorkloads from './namespaces/travel-portal/workloads.json';
import travelPortalTravels from './namespaces/travel-portal/workloads/travels.json';
import travelPortalViaggi from './namespaces/travel-portal/workloads/viaggi.json';
import travelPortalVoyages from './namespaces/travel-portal/workloads/voyages.json';

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
      workloads: {
        grafana: grafanaWorkload,
        istioegressgateway: istioegressgatewayWorkload,
        istioingressgateway: istioingressgatewayWorkload,
        istiod: istiodWorkload,
        jaeger: jaegerWorkload,
        kiali: kialiWorkload,
        prometheus: prometheusWorkload,
      },
      istioConfigList: istioSystemIstioConfig,
    },
    bookinfo: {
      tls: bookinfoTls,
      metrics: bookInfoMetrics,
      health: {
        app: bookinfoHealthApp,
        service: bookinfoHealthService,
        workload: bookinfoHealthWorkload,
      },
      workloads: {
        detailsv1: detailsWorkload,
        kialitrafficgenerator: kialitrafficWorkload,
        productpagev1: productpagev1Workload,
        ratingsv1: ratingsv1Workload,
        reviewsv1: reviewsv1Workload,
        reviewsv2: reviewsv2Workload,
        reviewsv3: reviewsv3Workload,
      },
      istioConfigList: bookinfoIstioConfig,
    },
    'travel-control': {
      tls: travelControlTls,
      metrics: travelControlMetrics,
      health: {
        app: travelControlHealthApp,
        service: travelControlHealthService,
        workload: travelControlHealthWorkload,
      },
      workloads: {
        control: travelControlWorkload,
      },
      istioConfigList: travelControlIstioConfig,
    },
    'travel-portal': {
      tls: travelPortalTls,
      metrics: travelPortalMetrics,
      health: {
        app: travelPortalHealthApp,
        service: travelPortalHealthService,
        workload: travelPortalHealthWorkload,
      },
      workloads: {
        travels: travelPortalTravels,
        viaggi: travelPortalViaggi,
        voyages: travelPortalVoyages,
      },
      istioConfigList: travelPortalIstioConfig,
    },
    'travel-agency': {
      tls: travelAgencyTls,
      metrics: travelAgencyMetrics,
      health: {
        app: travelAgencyHealthApp,
        service: travelAgencyHealthService,
        workload: travelAgencyHealthWorkload,
      },
      workloads: {
        carsv1: carsv1Workload,
        discountsv1: discountsv1Workload,
        flightsv1: flightsv1Workload,
        hotelsv1: hotelsv1Workload,
        insurancesv1: insurancesv1Workload,
        mysqldbv1: mysqldbv1Workload,
        travels: travelsv1Workload,
      },
      istioConfigList: travelAgencyIstioConfig,
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
