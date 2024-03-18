import React from 'react';

import { render, screen } from '@testing-library/react';

import { ReviewStep } from './ReviewStep';

import '@testing-library/jest-dom';

describe('ReviewStep', () => {
  const mockValues = {
    name: 'Test Role',
    kind: 'user',
    namespace: 'testns',
    description: 'Test Description',
    selectedMembers: [
      { label: 'User 1', etag: 'etag1', type: 'User', ref: 'User One' },
    ],
    permissionPoliciesRows: [
      {
        plugin: 'policy1',
        permission: 'permission1',
        policies: [{ policy: 'policy1', effect: 'allow' }],
      },
    ],
  };

  it('renders "Review and create" for new roles', () => {
    render(<ReviewStep values={mockValues} isEditing={false} />);
    expect(screen.getByText('Review and create')).toBeInTheDocument();
  });

  it('renders "Review and save" for editing existing roles', () => {
    render(<ReviewStep values={mockValues} isEditing />);
    expect(screen.getByText('Review and save')).toBeInTheDocument();
  });

  it('passes the correct metadata to StructuredMetadataTable', () => {
    render(<ReviewStep values={mockValues} isEditing={false} />);

    expect(screen.getByText('Users and groups (1 user)')).toBeInTheDocument();
    expect(screen.getByText('Permission policies (1)')).toBeInTheDocument();
    expect(screen.getByText(mockValues.name)).toBeInTheDocument();
    expect(screen.getByText(mockValues.description)).toBeInTheDocument();
  });
});
