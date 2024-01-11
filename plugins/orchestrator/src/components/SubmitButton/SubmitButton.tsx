import React from 'react';

import { Button, CircularProgress } from '@material-ui/core';

const SubmitButton = ({
  submitting,
  handleClick,
  children,
}: {
  submitting: boolean;
  handleClick: () => void;
  children: React.ReactNode;
}) => (
  <Button
    variant="contained"
    color="primary"
    onClick={handleClick}
    disabled={submitting}
    type="submit"
    startIcon={submitting ? <CircularProgress size="1rem" /> : null}
  >
    {children}
  </Button>
);

export default SubmitButton;
