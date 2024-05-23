import React, { ReactNode } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

type Props = {
  title: string;
  subTitle?: ReactNode;
  isLoading?: boolean;
};

export const StatsCard = ({ title, subTitle, isLoading }: Props) => {
  return (
    <Card style={{ height: '300px' }}>
      <CardContent
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isLoading ? (
          <CircularProgress size={64} />
        ) : (
          <>
            <Typography
              style={{ textAlign: 'center' }}
              variant="h5"
              component="div"
            >
              {title}
            </Typography>
            <Typography
              variant="h1"
              component="div"
              style={{ textAlign: 'center' }}
            >
              {subTitle || 'N/A'}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};
