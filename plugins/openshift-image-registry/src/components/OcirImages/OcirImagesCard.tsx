import React from 'react';

import {
  ItemCardHeader,
  LinkButton,
  MarkdownContent,
} from '@backstage/core-components';

import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';

import { ImageStreamMetadata } from '../../types';

const useStyles = makeStyles<Theme>(theme => ({
  label: {
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    lineHeight: 1,
    paddingBottom: '0.2rem',
  },
  description: {
    '& p': {
      margin: '0px',
    },
  },
}));

type OcirImagesCardProps = {
  imageStream: ImageStreamMetadata;
  onImageStreamSelected: (imageStream: ImageStreamMetadata) => void;
};

export const OcirImagesCard = ({
  imageStream,
  onImageStreamSelected,
}: OcirImagesCardProps) => {
  const classes = useStyles();

  return (
    <Card>
      <CardMedia>
        <ItemCardHeader title={imageStream.name} />
      </CardMedia>
      <CardContent
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <Box>
          <Typography variant="body2" className={classes.label}>
            Description
          </Typography>
          <MarkdownContent
            content={imageStream.description ?? 'N/A'}
            className={classes.description}
          />
        </Box>
        <Box>
          <Typography variant="body2" className={classes.label}>
            Last Modified
          </Typography>
          <span className={classes.description}>
            {imageStream.last_modified || 'N/A'}
          </span>
        </Box>
        <Box>
          <Typography
            variant="body2"
            className={classes.label}
            style={{ marginBottom: '4px' }}
          >
            Tags
          </Typography>
          {imageStream.tags?.length
            ? imageStream.tags.map((tag: string) => (
                <Chip key={tag} size="small" label={tag} />
              ))
            : 'N/A'}
        </Box>
      </CardContent>
      <CardActions>
        <LinkButton
          color="primary"
          to=""
          onClick={() => onImageStreamSelected(imageStream)}
        >
          Open
        </LinkButton>
      </CardActions>
    </Card>
  );
};
