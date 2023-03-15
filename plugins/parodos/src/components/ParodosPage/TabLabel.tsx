import React, { forwardRef, type ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import StarIcon from '@material-ui/icons/Star';

const useStyles = makeStyles({
  highlightedTab: {
    position: 'absolute',
    top: '1rem',
    right: 0,
    color: '#F70D1A',
  },
});

export interface TabLabelProps {
  icon: ReactNode;
  highlighted: boolean;
  children: ReactNode;
}

export const TabLabel = forwardRef<HTMLSpanElement, TabLabelProps>(
  ({ children, icon, highlighted, ...props }, ref) => {
    const styles = useStyles();

    return (
      <span {...props} ref={ref}>
        {icon}
        {highlighted && <StarIcon className={styles.highlightedTab} />}
        {children}
      </span>
    );
  },
);
