import React, { useState } from 'react';

import { FormHelperText, TextField } from '@material-ui/core';

import { PullRequestPreview, PullRequestPreviewData } from '../../types';

interface KeyValueTextFieldProps {
  repoName: string;
  label: string;
  name: string;
  value: string;
  onChange: (
    event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void;
  formErrors: PullRequestPreviewData;
  setFormErrors: (pullRequest: PullRequestPreviewData) => void;
}

const validateKeyValuePairs = (value: string): string | null => {
  const keyValuePairs = value.split(';').map(pair => pair.trim());
  for (const pair of keyValuePairs) {
    if (pair) {
      const [key, val] = pair.split(':').map(part => part.trim());
      if (!key || !val) {
        return 'Each entry must have a key and a value separated by a colon.';
      }
    }
  }
  return null;
};

const KeyValueTextField: React.FC<KeyValueTextFieldProps> = ({
  repoName,
  label,
  name,
  value,
  onChange,
  setFormErrors,
  formErrors,
}) => {
  const [error, setError] = useState<string | null>(null);
  const fieldName = name.split('.').pop() ?? '';

  const removeError = () => {
    const err = { ...formErrors };
    if (err[repoName]) {
      delete err[repoName][fieldName as keyof PullRequestPreview];
    }
    setFormErrors(err);
  };

  const getUpdatedFormError = (
    validationError: string,
  ): PullRequestPreviewData => {
    return {
      ...formErrors,
      [repoName]: {
        ...formErrors[repoName],
        [fieldName]: validationError,
      },
    };
  };

  const handleChange = (
    event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement, Element>,
  ) => {
    const validationError = validateKeyValuePairs(event.target.value);
    if (validationError) {
      setError(validationError);
      setFormErrors(getUpdatedFormError(validationError));
    } else {
      setError(null);
      removeError();
    }
    onChange(event);
  };

  return (
    <div>
      <TextField
        multiline
        label={label}
        placeholder="key1: value2; key2: value2"
        variant="outlined"
        margin="normal"
        fullWidth
        name={name}
        value={value}
        onChange={handleChange}
        error={!!error}
        helperText={error}
      />
      <FormHelperText style={{ marginLeft: '0.8rem' }}>
        Use semicolon to separate {label.toLowerCase()}
      </FormHelperText>
    </div>
  );
};

export default KeyValueTextField;
