import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PipelineRunListSearchBar } from './PipelineRunListSearchBar';

describe('PipelineRunListSearchBar', () => {
  test('renders PipelineRunListSearchBar component', () => {
    const { getByPlaceholderText } = render(
      <PipelineRunListSearchBar value="" onChange={() => {}} />,
    );

    screen.logTestingPlaygroundURL();

    expect(getByPlaceholderText('Search')).toBeInTheDocument();
  });

  test('handles search input change', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText, getByTestId } = render(
      <PipelineRunListSearchBar value="" onChange={onChange} />,
    );
    const searchInput = getByPlaceholderText('Search');
    const clearButton = getByTestId('clear-search');
    expect(clearButton.getAttribute('disabled')).toBe(''); // disabled

    fireEvent.change(searchInput, { target: { value: 'example' } });

    expect(onChange).toHaveBeenCalledWith('example');
  });

  test('clears search input', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <PipelineRunListSearchBar value="example" onChange={onChange} />,
    );
    const clearButton = getByTestId('clear-search');
    expect(clearButton.getAttribute('disabled')).toBe(null); // not disabled

    fireEvent.click(getByTestId('clear-search'));

    expect(onChange).toHaveBeenCalledWith('');
  });
});
