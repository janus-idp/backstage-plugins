import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PipelineRunListSearchBar } from './PipelineRunListSearchBar';

jest.mock('react-use/lib/useDebounce', () => {
  return jest.fn(fn => fn);
});

describe('PipelineRunListSearchBar', () => {
  test('renders PipelineRunListSearchBar component', () => {
    const { getByPlaceholderText } = render(
      <PipelineRunListSearchBar onSearch={() => {}} />,
    );

    screen.logTestingPlaygroundURL();

    expect(getByPlaceholderText('Search')).toBeInTheDocument();
  });

  test('handles search input change', () => {
    const { getByPlaceholderText } = render(
      <PipelineRunListSearchBar onSearch={() => {}} />,
    );
    const searchInput = getByPlaceholderText('Search');

    fireEvent.change(searchInput, { target: { value: 'example' } });

    expect((searchInput as HTMLInputElement).value).toBe('example');
  });

  test('clears search input', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <PipelineRunListSearchBar onSearch={() => {}} />,
    );
    const searchInput = getByPlaceholderText('Search');

    fireEvent.change(searchInput, { target: { value: 'example' } });

    expect((searchInput as HTMLInputElement).value).toBe('example');

    fireEvent.click(getByTestId('clear-search'));

    expect((searchInput as HTMLInputElement).value).toBe('');
  });
});
