import { VulnerabilitySeverity } from '../types';
import { SEVERITY_COLORS } from './utils';

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
