import React from 'react';

import { fireEvent, render, screen, within } from '@testing-library/react';

import '@testing-library/jest-dom';

import { mockTransformedConditionRules } from '../../__fixtures__/mockTransformedConditionRules';
import { PermissionPoliciesFormRow } from './PermissionPoliciesFormRow';

describe('PermissionPoliciesFormRow', () => {
  const mockProps = {
    permissionPoliciesRowData: {
      plugin: '',
      permission: '',
      policies: [],
      isResourced: false,
    },
    permissionPoliciesData: {
      plugins: ['', 'Plugin1', 'Plugin2'],
      pluginsPermissions: {
        Plugin1: {
          permissions: ['Permission1', 'Permission2'],
          policies: {},
        },
        Plugin2: {
          permissions: ['Permission1', 'Permission2'],
          policies: {},
        },
      },
    },
    permissionPoliciesRowError: { plugin: '', permission: '' },
    rowCount: 2,
    rowName: 'testRow',
    conditionRules: { data: mockTransformedConditionRules },
    onRemove: jest.fn(),
    onChangePlugin: jest.fn(),
    onChangePermission: jest.fn(),
    onChangePolicy: jest.fn(),
    handleBlur: jest.fn(),
    getPermissionDisabled: jest.fn().mockReturnValue(false),
    onAddConditions: jest.fn(),
  };

  it('renders without crashing', () => {
    render(<PermissionPoliciesFormRow {...mockProps} />);
    expect(
      screen.getByRole('textbox', {
        name: /plugin/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: /resource type/i,
      }),
    ).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    const { getByTitle } = render(<PermissionPoliciesFormRow {...mockProps} />);
    const removeButton = getByTitle('Remove');
    fireEvent.click(removeButton);
    expect(mockProps.onRemove).toHaveBeenCalled();
  });

  it('calls onChangePlugin when a plugin is selected', async () => {
    const { getByLabelText, findByText } = render(
      <PermissionPoliciesFormRow {...mockProps} />,
    );

    fireEvent.mouseDown(getByLabelText(/Plugin/));
    const pluginOption = await findByText('Plugin1');
    const listboxElement = pluginOption.closest('ul');

    if (!listboxElement) {
      throw new Error('Unable to find the listbox element.');
    }

    const listbox = within(listboxElement);
    fireEvent.click(listbox.getByText(/Plugin1/));

    expect(mockProps.onChangePlugin).toHaveBeenCalledWith('Plugin1');
  });

  it('opens sidebar on clicking conditional access button', async () => {
    const newMockProps = {
      ...mockProps,
      permissionPoliciesRowData: {
        plugin: 'catalog',
        permission: 'catalog-entity',
        isResourced: true,
        policies: [],
      },
    };

    const { queryByTestId } = render(
      <PermissionPoliciesFormRow {...newMockProps} />,
    );

    expect(queryByTestId('rules-sidebar')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('configure-access'));
    expect(queryByTestId('rules-sidebar')).toBeInTheDocument();
  });
});
