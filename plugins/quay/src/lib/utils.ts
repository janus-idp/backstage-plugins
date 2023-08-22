import { VulnerabilitySeverity } from '../types';

export const SEVERITY_COLORS = new Proxy(
  new Map([
    [VulnerabilitySeverity.Critical, '#7D1007'],
    [VulnerabilitySeverity.High, '#C9190B'],
    [VulnerabilitySeverity.Medium, '#EC7A08'],
    [VulnerabilitySeverity.Low, '#F0AB00'],
    [VulnerabilitySeverity.None, '#3E8635'],
  ]) as any,
  {
    get: (o: Map<VulnerabilitySeverity, string>, k: VulnerabilitySeverity) =>
      o.has(k) ? o.get(k) : '#8A8D90',
  },
);
