import React from 'react';

import { MarkdownContent } from '@backstage/core-components';
import { AboutField } from '@backstage/plugin-catalog';

import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  makeStyles,
} from '@material-ui/core';

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

export const AboutCard = () => {
  const classes = useStyles();
  const cardClass = classes.gridItemCard;
  const cardContentClass = classes.gridItemCardContent;

  return (
    <Card className={cardClass}>
      <CardHeader title="About" />
      <CardContent className={cardContentClass}>
        <Grid container>
          <AboutField label="Description" gridSizes={{ xs: 4, sm: 8, lg: 4 }}>
            <MarkdownContent
              className={classes.text}
              content="No description"
            />
          </AboutField>
          <AboutField label="Modified By" gridSizes={{ xs: 4, sm: 8, lg: 4 }}>
            <MarkdownContent
              className={classes.text}
              content="No information"
            />
          </AboutField>
          <AboutField label="Last Modified" gridSizes={{ xs: 4, sm: 8, lg: 4 }}>
            <MarkdownContent
              className={classes.text}
              content="No information"
            />
          </AboutField>
        </Grid>
      </CardContent>
    </Card>
  );
};
