import { Layer, VulnerabilitySeverity } from '../types';
import { SEVERITY_COLORS, vulnerabilitySummary } from './utils';
import { mockLayer } from './utils.data';

describe('SEVERITY_COLORS', () => {
  it('should return the correct hex color code', () => {
    const severity = VulnerabilitySeverity.Critical;

    const result = SEVERITY_COLORS[severity];

    expect(result).toBe('#7D1007');
  });

  it('should return the default color code if the severity is unknown', () => {
    const result = SEVERITY_COLORS[VulnerabilitySeverity.Unknown];

    expect(result).toBe('#8A8D90');
  });
});

describe('vulnerabilitySummary', () => {
  test('returns "Passed" when no vulnerabilities are present', () => {
    const layer: Layer = {
      Name: 'TestLayer',
      ParentName: 'ParentLayer',
      NamespaceName: 'Namespace',
      IndexedByVersion: 1,
      Features: [
        {
          Name: 'Feature1',
          VersionFormat: '1.0.0',
          NamespaceName: 'Namespace',
          AddedBy: 'Tester',
          Version: '1.0.0',
          Vulnerabilities: [],
        },
      ],
    };

    expect(vulnerabilitySummary(layer)).toBe('Passed');
  });

  test('returns a string with vulnerability counts in the correct order', () => {
    const result = vulnerabilitySummary(mockLayer as Layer);
    expect(result).toMatch('High: 3, Medium: 2, Low: 1');
  });
});
