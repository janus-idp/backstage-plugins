import { icons, IconType } from '../../../config/Icons';

export const badgeMap = new Map<string, IconType>()
  .set('CB', icons.istio.circuitBreaker) // bolt
  .set('FI', icons.istio.faultInjection) // ban
  .set('GW', icons.istio.gateway) // globe
  .set('MI', icons.istio.mirroring) // migration
  .set('MS', icons.istio.missingSidecar) // blueprint
  .set('RO', icons.istio.root) // alt-arrow-circle-right
  .set('RR', icons.istio.requestRouting) // code-branch
  .set('RT', icons.istio.requestTimeout) // clock
  .set('TS', icons.istio.trafficShifting) // share-alt
  .set('VS', icons.istio.virtualService) // code-branch
  .set('WE', icons.istio.workloadEntry); // pf-icon-virtual-machine
