import React from 'react';

import {
  MarkdownContent,
  Progress,
  WarningPanel,
} from '@backstage/core-components';
import { AboutField } from '@backstage/plugin-catalog';

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  makeStyles,
} from '@material-ui/core';

import { useRole } from '../../hooks/useRole';

const useStyles = makeStyles({
  gridItemCard: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 10px)', // for pages without content header
    marginBottom: '10px',
  },
  fullHeightCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  gridItemCardContent: {
    flex: 1,
  },
  fullHeightCardContent: {
    flex: 1,
  },
  text: {
    wordBreak: 'break-word',
  },
});

type AboutCardProps = {
  roleName: string;
};

export const AboutCard = ({ roleName }: AboutCardProps) => {
  const classes = useStyles();
  const cardClass = classes.gridItemCard;
  const cardContentClass = classes.gridItemCardContent;

  const { role, roleError, loading } = useRole(roleName);
  if (loading) {
    return <Progress />;
  }
  return (
    <Card className={cardClass}>
      <CardHeader title="About" />
      <CardContent className={cardContentClass}>
        {roleError.name ? (
          <div style={{ paddingBottom: '16px' }}>
            <WarningPanel
              message={roleError?.message}
              title="Something went wrong while fetching role"
              severity="error"
            />
          </div>
        ) : (
          <Grid container>
            <AboutField label="Description" gridSizes={{ xs: 4, sm: 8, lg: 4 }}>
              <MarkdownContent
                className={classes.text}
                content={role?.metadata?.description ?? 'No description'}
              />
            </AboutField>
            <AboutField label="Modified By" gridSizes={{ xs: 4, sm: 8, lg: 4 }}>
              <MarkdownContent
                className={classes.text}
                content={role?.metadata?.modifiedBy ?? 'No information'}
              />
            </AboutField>
            <AboutField
              label="Last Modified"
              gridSizes={{ xs: 4, sm: 8, lg: 4 }}
            >
              <MarkdownContent
                className={classes.text}
                content={role?.metadata?.lastModified ?? 'No information'}
              />
            </AboutField>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};
