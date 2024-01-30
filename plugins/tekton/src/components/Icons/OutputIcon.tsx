import * as React from 'react';

import { createStyles, makeStyles, Theme } from '@material-ui/core';
import { SVGIconProps } from '@patternfly/react-icons/dist/esm/createIcon';
import classNames from 'classnames';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: {
      fill: 'var(--pf-v5-global--Color--100)',
    },
    disabledButton: {
      fill: theme.palette.grey[600],
    },
  }),
);

const OutputIcon: React.FC<SVGIconProps> = (props): React.ReactElement => {
  const classes = useStyles();
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classNames(classes.icon, {
        [classes.disabledButton]: props.disabled,
      })}
      {...props}
    >
      <path d="M5 21C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V5C3 4.45 3.19583 3.97917 3.5875 3.5875C3.97917 3.19583 4.45 3 5 3H19C19.55 3 20.0208 3.19583 20.4125 3.5875C20.8042 3.97917 21 4.45 21 5V19C21 19.55 20.8042 20.0208 20.4125 20.4125C20.0208 20.8042 19.55 21 19 21H5ZM5 19H19V7H5V19ZM7 12V10H17V12H7ZM7 16V14H13V16H7Z" />
    </svg>
  );
};

export default OutputIcon;
