import React from 'react';

import { Button } from '@material-ui/core';
import { useArgs } from '@storybook/preview-api';
import { Meta, StoryObj } from '@storybook/react';

import { InfoDialog } from './InfoDialog';

const meta = {
  title: 'Orchestrator/InfoDialog',
  component: InfoDialog,
} satisfies Meta<typeof InfoDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const handleSubmit = () => console.log('submitted');

const ConfirmationDialogContent = () => (
  <div>
    Are you sure you want to submit? By click the submit button, you cannot
    change the action
  </div>
);
const AlertDialogContent = () => (
  <div>
    Let Google help apps determine location. This means sending anonymous
    location data to Google, even when no apps are running.
  </div>
);

export const ConfirmDialogStory: Story = {
  name: 'Confirm Dialog',
  args: {
    title: 'Confirm',
    open: true,
    children: <ConfirmationDialogContent />,
  },
  render: function Render(args) {
    const [{ open }, updateArgs] = useArgs();
    const DialogActions = () => (
      <>
        <Button onClick={handleClose} color="primary">
          Disagree
        </Button>
        <Button onClick={handleSubmit} color="primary" autoFocus>
          Agree
        </Button>
      </>
    );

    const handleClose = () => {
      updateArgs({ open: !open });
    };

    return (
      <InfoDialog
        {...args}
        close={handleClose}
        dialogActions={<DialogActions />}
      />
    );
  },
};

export const AlertDialogStory: Story = {
  name: 'Alert Dialog',
  args: {
    title: 'Alert',
    open: true,
    children: <AlertDialogContent />,
  },
  render: function Render(args) {
    const [{ open }, updateArgs] = useArgs();

    const handleClose = () => {
      updateArgs({ open: !open });
    };

    const DialogActions = () => (
      <>
        <Button onClick={handleClose} color="primary">
          Disagree
        </Button>
        <Button onClick={handleSubmit} color="primary" autoFocus>
          Agree
        </Button>
      </>
    );

    return (
      <InfoDialog
        {...args}
        close={handleClose}
        dialogActions={<DialogActions />}
      />
    );
  },
};
