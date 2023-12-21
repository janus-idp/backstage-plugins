import React from 'react';

import { CopyTextButton, MarkdownContent } from '@backstage/core-components';

import {
  Box,
  Chip,
  createStyles,
  Drawer,
  IconButton,
  Input,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import Close from '@material-ui/icons/Close';

import { ImageStreamMetadata } from '../../types';

const useDrawerStyles = makeStyles<Theme>(theme =>
  createStyles({
    paper: {
      width: '40%',
      padding: theme.spacing(2.5),
      gap: '3%',
    },
  }),
);

const useDrawerContentStyles = makeStyles<Theme>(theme =>
  createStyles({
    header: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    icon: {
      fontSize: 20,
    },
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
  }),
);

type OcirImageSidebarProps = {
  open: boolean;
  onClose: () => void;
  imageStream: ImageStreamMetadata;
};

export const OcirImageSidebar = ({
  open,
  onClose,
  imageStream,
}: OcirImageSidebarProps) => {
  const classes = useDrawerStyles();
  const contentClasses = useDrawerContentStyles();
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      classes={{
        paper: classes.paper,
      }}
    >
      <>
        <div className={contentClasses.header}>
          <Typography variant="h5">{imageStream.name}</Typography>
          <IconButton
            key="dismiss"
            title="Close the drawer"
            onClick={onClose}
            color="inherit"
          >
            <Close className={contentClasses.icon} />
          </IconButton>
        </div>
        <>
          <Box>
            <Typography variant="body2" className={contentClasses.label}>
              Description
            </Typography>
            <MarkdownContent
              content={imageStream.description ?? 'N/A'}
              className={contentClasses.description}
            />
          </Box>
          <Box>
            <Typography variant="body2" className={contentClasses.label}>
              Last Modified
            </Typography>
            <span className={contentClasses.description}>
              {imageStream.last_modified || 'N/A'}
            </span>
          </Box>
          <Box>
            <Typography variant="body2" className={contentClasses.label}>
              Version
            </Typography>
            <span className={contentClasses.description}>
              {imageStream.version ?? 'N/A'}
            </span>
          </Box>
          <Box>
            <Typography variant="body2" className={contentClasses.label}>
              Size
            </Typography>
            <span className={contentClasses.description}>
              {imageStream.size ?? 'N/A'}
            </span>
          </Box>
          <Box>
            <Typography
              variant="body2"
              className={contentClasses.label}
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
          <Box>
            <Typography variant="body2" className={contentClasses.label}>
              Docker Pull Command
            </Typography>
            {imageStream.dockerImageRepo ? (
              <Input
                defaultValue={`docker pull ${imageStream.dockerImageRepo}`}
                readOnly
                fullWidth
                style={{
                  fontSize: '14px',
                  paddingLeft: '12px',
                }}
                margin="dense"
                endAdornment={
                  <CopyTextButton
                    text={`docker pull ${imageStream.dockerImageRepo}`}
                    tooltipText="Command copied to clipboard"
                    tooltipDelay={2000}
                  />
                }
              />
            ) : (
              'N/A'
            )}
          </Box>
        </>
      </>
    </Drawer>
  );
};
