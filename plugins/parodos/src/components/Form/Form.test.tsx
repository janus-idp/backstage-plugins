import React from 'react';
import { mockAndromedaWorkflowDefinition } from '../../mocks/workflowDefinitions/andromeda';
import { FormSchema } from '../types';
import { jsonSchemaFromWorkflowDefinition } from '../../hooks/useWorkflowDefinitionToJsonSchema';
import { act, fireEvent, render } from '@testing-library/react';
import { Form } from './Form';

// very simple test to at least check we have not broken the JSONForm
describe('<Form />', () => {
  const mockWorkflow = {
    ...mockAndromedaWorkflowDefinition,
    tasks: [mockAndromedaWorkflowDefinition.tasks[0]],
  };
  const formSchema: FormSchema = jsonSchemaFromWorkflowDefinition(mockWorkflow);

  it('renders the dynamic form', () => {
    const { getByRole } = render(
      <Form formSchema={formSchema} onSubmit={jest.fn()} />,
    );

    expect(getByRole('textbox', { name: 'api-server' })).toBeInTheDocument();
  });

  it('can submit the form', async () => {
    const onSubmit = jest.fn();

    const { getByRole } = render(
      <Form formSchema={formSchema} onSubmit={onSubmit} />,
    );

    await fireEvent.change(getByRole('textbox', { name: 'api-server' }), {
      target: { value: 'https://someurl.com' },
    });

    await act(async () => {
      await fireEvent.click(getByRole('button', { name: 'Submit' }));
    });

    expect(onSubmit).toHaveBeenCalled();
  });
});
