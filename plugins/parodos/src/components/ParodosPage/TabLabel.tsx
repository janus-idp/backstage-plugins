import React, { type ReactNode } from 'react';
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

export function TabLabel({
  children,
  icon,
  highlighted,
  ...props
}: TabLabelProps) {
  const styles = useStyles();

  return (
    <span {...props}>
      {icon}
      {highlighted && <StarIcon className={styles.highlightedTab} />}
      {children}
    </span>
  );
}
