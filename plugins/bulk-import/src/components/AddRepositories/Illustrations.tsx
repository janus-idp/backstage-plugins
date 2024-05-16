import * as React from 'react';

import { makeStyles } from '@material-ui/core';

import { getImageForIconClass } from '../../utils/icons';

const useStyles = makeStyles(() => ({
  text: {
    maxWidth: '150px',
  },
}));

export const Illustrations = ({
  iconClassname,
  iconText,
}: {
  iconClassname: string;
  iconText: string;
}) => {
  const styles = useStyles();
  return (
    <div>
      <img
        src={getImageForIconClass(iconClassname)}
        alt={iconText}
        height="100px"
      />
      <p className={styles.text}>{iconText}</p>
    </div>
  );
};
