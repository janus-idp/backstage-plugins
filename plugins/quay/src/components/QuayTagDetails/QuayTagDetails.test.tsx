import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render } from '@testing-library/react';

import data from '../../api/fixtures/securityDetail/foo.json';
import { Layer } from '../../types';
import QuayTagDetails from './component';

describe('QuayTagDetails', () => {
  it('should render tag details if vulnerabilities exists', () => {
    const { queryByText } = render(
      <BrowserRouter>
        <QuayTagDetails
          layer={data.data.Layer as Layer}
          rootLink={jest.fn()}
          digest="data-digest"
        />
        ,
      </BrowserRouter>,
    );
    expect(queryByText(/Back to repository/i)).toBeInTheDocument();
    expect(queryByText(/Vulnerabilities for data-digest/i)).toBeInTheDocument();
  });
});
