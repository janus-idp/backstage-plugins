import { EmptyState } from '@backstage/core-components';
import { render } from '@testing-library/react';
import * as React from 'react';
import { TopologyEmptyState } from './TopologyEmptyState';

describe('TopologyEmptyState', () => {
  it('should render TopologyEmptyState', () => {
    const { getByText } = render(<TopologyEmptyState />);
    expect(EmptyState).toBeDefined();
    expect(getByText('No resources found')).toBeInTheDocument();
  });
});
