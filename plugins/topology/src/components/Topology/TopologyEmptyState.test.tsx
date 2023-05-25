import { render } from '@testing-library/react';
import React from 'react';
import { TopologyEmptyState } from './TopologyEmptyState';

describe('TopologyEmptyState', () => {
  it('should render TopologyEmptyState', () => {
    const { getByText } = render(<TopologyEmptyState />);
    expect(getByText('No resources found')).toBeInTheDocument();
  });
});
