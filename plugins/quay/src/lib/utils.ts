import { Layer, VulnerabilityOrder, VulnerabilitySeverity } from '../types';

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

export const vulnerabilitySummary = (layer: Layer): string => {
  const summary: Record<string, number> = {};

  layer?.Features.forEach(feature => {
    feature.Vulnerabilities?.forEach(vulnerability => {
      const { Severity } = vulnerability;
      if (!summary[Severity]) {
        summary[Severity] = 0;
      }
      summary[Severity]++;
    });
  });

  const scanResults = Object.entries(summary)
    .sort((a, b) => {
      const severityA = VulnerabilityOrder[a[0] as VulnerabilitySeverity];
      const severityB = VulnerabilityOrder[b[0] as VulnerabilitySeverity];

      return severityA - severityB;
    })
    .map(([severity, count]) => `${severity}: ${count}`)
    .join(', ');
  return scanResults.trim() !== '' ? scanResults : 'Passed';
};
