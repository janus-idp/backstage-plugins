import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@mui/material/Typography';
import classNames from 'classnames';

import CamelCaseWrap from './CamelCaseWrap';

const DASH = '-';

const useStyles = makeStyles({
  iconAndText: {
    alignItems: 'baseline',
    display: 'flex',
    fontWeight: 400,
    fontSize: '14px',
  },

  flexChild: {
    flex: ' 0 0 auto',
    position: 'relative',
    top: '0.125em',
  },
});

export const StatusIconAndText = ({
  icon,
  title,
  spin,
  iconOnly,
  className,
  dataTestId,
}: {
  title: string;
  iconOnly?: boolean;
  className?: string;
  icon: React.ReactElement;
  spin?: boolean;
  dataTestId?: string;
}): React.ReactElement => {
  const styles = useStyles();
  if (!title) {
    return <>{DASH}</>;
  }

  if (iconOnly) {
    return (
      <>
        {React.cloneElement(icon, {
          'data-testid': dataTestId ?? `icon-only-${title}`,
          className: icon.props.className,
        })}
      </>
    );
  }

  return (
    <Typography
      className={classNames(styles.iconAndText, className)}
      data-testid={dataTestId ?? `icon-with-title-${title}`}
      title={title}
    >
      {React.cloneElement(icon, {
        className: classNames(
          spin && 'fa-spin',
          icon.props.className,
          styles.flexChild,
        ),
      })}
      <CamelCaseWrap value={title} dataTest="status-text" />
    </Typography>
  );
};

export default StatusIconAndText;
