import React from 'react';

import { TextField } from '@material-ui/core';

type RoleDetailsFormProps = {
  name: string;
  description?: string;
  nameError?: string;
  handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  handleChange: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  >;
};

export const RoleDetailsForm = ({
  name,
  description,
  nameError,
  handleBlur,
  handleChange,
}: RoleDetailsFormProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <TextField
        required
        label="Name"
        variant="outlined"
        id="role-name"
        data-testid="role-name"
        aria-labelledby="name"
        helperText={nameError ?? 'Enter name of the role'}
        value={name}
        name="name"
        onChange={handleChange}
        onBlur={handleBlur}
        error={!!nameError}
      />
      <TextField
        label="Description"
        variant="outlined"
        helperText="Enter a brief description about the role (The purpose of the role)"
        value={description}
        data-testid="role-description"
        id="role-description"
        name="description"
        aria-labelledby="description"
        onChange={handleChange}
        onBlur={handleBlur}
        multiline
      />
    </div>
  );
};
