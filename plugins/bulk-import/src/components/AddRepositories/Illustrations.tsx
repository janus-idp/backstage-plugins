import * as React from 'react';

import { makeStyles } from '@mui/styles';

import { getImageForIconClass } from '../../utils/icons';

const useStyles = makeStyles(() => ({
  text: {
    maxWidth: '150px',
    textAlign: 'center',
  },
  img: {
    justifyContent: 'center',
    display: 'flex',
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
      <span className={styles.img}>
        <img
          src={getImageForIconClass(iconClassname)}
          alt={iconText}
          height="100px"
        />
      </span>
      <p className={styles.text}>{iconText}</p>
    </div>
  );
};
