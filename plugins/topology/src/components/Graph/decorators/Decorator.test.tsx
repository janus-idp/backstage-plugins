import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Link, MemoryRouter } from 'react-router-dom';
import { Decorator as PfDecorator } from '@patternfly/react-topology';
import Decorator from './Decorator';

jest.mock('@patternfly/react-topology', () => ({
  Decorator: () => <div>Decorator</div>,
}));

describe('Decorator', () => {
  it('should render PfDecorator', () => {
    render(<Decorator x={0} y={0} radius={0} />);
    expect(PfDecorator).toBeDefined();
  });

  it('should render Link if external is false', () => {
    render(
      <MemoryRouter>
        <Decorator x={0} y={0} radius={0} href="test" />
      </MemoryRouter>,
    );
    expect(Link).toBeDefined();
  });

  it('should render Link with aria-label if external is false', () => {
    render(
      <MemoryRouter>
        <Decorator x={0} y={0} radius={0} href="test" ariaLabel="test" />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText('test')).toBeInTheDocument();
  });

  it('should render anchor if external is true', () => {
    render(<Decorator x={0} y={0} radius={0} href="test" external />);
    expect(screen.getByRole('button')).toHaveAttribute('target', '_blank');
  });
});
