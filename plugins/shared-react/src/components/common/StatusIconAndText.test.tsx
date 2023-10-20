import React from 'react';

import { render } from '@testing-library/react';

import { ComputedStatus } from '../../types';
import StatusIconAndText from './StatusIconAndText';

describe('StatusIconAndText', () => {
  it('should render only icon', () => {
    const { getByTestId } = render(
      <StatusIconAndText
        icon={<div id="green-check-icon" />}
        iconOnly
        title={ComputedStatus.Succeeded}
      />,
    );

    expect(getByTestId('icon-only-Succeeded')).not.toBeNull();
  });
  it('should render with text', () => {
    const { getByTestId } = render(
      <StatusIconAndText
        icon={<div id="green-check-icon" />}
        title={ComputedStatus.Succeeded}
      />,
    );

    expect(getByTestId('icon-with-title-Succeeded')).not.toBeNull();
    expect(getByTestId('status-text')).not.toBeNull();
  });

  it('should render DASH when there is not title', () => {
    const { getByText } = render(
      <StatusIconAndText
        icon={<div id="green-check-icon" />}
        iconOnly
        title={''}
      />,
    );

    expect(getByText('-')).toBeInTheDocument();
  });
});
