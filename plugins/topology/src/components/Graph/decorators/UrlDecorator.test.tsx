import React from 'react';

import { render, screen } from '@testing-library/react';

import { UrlDecorator } from './UrlDecorator';

// mock Decorator
jest.mock('@patternfly/react-topology', () => ({
  Decorator: () => <div>Decorator</div>,
}));

describe('UrlDecorator', () => {
  it('should not render decorator if not ingress is mapped', () => {
    render(<UrlDecorator radius={0} x={0} y={0} />);
    expect(screen.queryByText('Decorator')).not.toBeInTheDocument();
  });

  it('should render decorator if ingress is mapped', () => {
    render(<UrlDecorator url="http://hello-world" radius={0} x={0} y={0} />);
    expect(screen.queryByText('Decorator')).toBeInTheDocument();
  });
});
