import React from 'react';

import { Button, CircularProgress } from '@material-ui/core';

const SubmitButton = ({
  submitting,
  handleClick,
  children,
  focusOnMount,
}: {
  submitting: boolean;
  handleClick?: () => void;
  children: React.ReactNode;
  focusOnMount?: boolean;
}) => {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (focusOnMount) {
      ref.current?.focus();
    }
  }, [focusOnMount]);
  return (
    <Button
      ref={ref}
      variant="contained"
      color="primary"
      onClick={handleClick}
      disabled={submitting}
      type="submit"
      startIcon={submitting ? <CircularProgress size="1rem" /> : null}
      // work around for using react 18 with material 4 causes button to crash when pressing enter, see https://github.com/mui/material-ui/issues/30953
      // this will be resolved when upgrading to material 5
      disableRipple
    >
      {children}
    </Button>
  );
};

export default SubmitButton;
