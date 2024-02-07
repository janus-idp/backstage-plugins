import * as React from 'react';

import { Link } from '@backstage/core-components';

import {
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Alert } from '@material-ui/lab';

import { config, KialiIcon, KialiLogo } from '../../config';
import { kialiStyle } from '../../styles/StyleUtils';
import {
  ExternalServiceInfo,
  Status,
  StatusKey,
} from '../../types/StatusState';

type AboutUIModalProps = {
  status: Status;
  externalServices: ExternalServiceInfo[];
  warningMessages: string[];
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const iconStyle = kialiStyle({
  marginRight: '10px',
});

const textContentStyle = kialiStyle({
  $nest: {
    '& dt, & dd': {
      lineHeight: 1.667,
    },
  },
});

const closeButton = kialiStyle({
  position: 'absolute',
  right: 10,
  top: 10,
});

export const AboutUIModal = (props: AboutUIModalProps) => {
  const [showWarnings, setShowWarnings] = React.useState<boolean>(false);

  const additionalComponentInfoContent = (
    externalService: ExternalServiceInfo,
  ) => {
    if (!externalService.version && !externalService.url) {
      return 'N/A';
    }
    const version = externalService.version ? externalService.version : '';
    const url = externalService.url ? (
      <a href={externalService.url} target="_blank" rel="noopener noreferrer">
        {externalService.url}
      </a>
    ) : (
      ''
    );
    return (
      <>
        {version} {url}
      </>
    );
  };

  const renderComponent = (externalService: ExternalServiceInfo) => {
    const name = externalService.version
      ? externalService.name
      : `${externalService.name} URL`;
    const additionalInfo = additionalComponentInfoContent(externalService);
    return (
      <>
        <Grid item xs={8} key={`component_${name}`}>
          {name}
        </Grid>
        <Grid item xs={4} key={`component_version_${name}`}>
          {additionalInfo}
        </Grid>
      </>
    );
  };

  const renderWebsiteLink = () => {
    if (config.about?.website) {
      return (
        <Link to={config.about.website.url} style={{ color: '#2b9af3' }}>
          <KialiIcon.Website className={iconStyle} />
          {config.about.website.linkText}
        </Link>
      );
    }

    return null;
  };

  const renderProjectLink = () => {
    if (config.about?.project) {
      return (
        <Link to={config.about.project.url} style={{ color: '#2b9af3' }}>
          <KialiIcon.Repository className={iconStyle} />
          {config.about.project.linkText}
        </Link>
      );
    }

    return null;
  };

  const coreVersion =
    props.status[StatusKey.KIALI_CORE_COMMIT_HASH] === '' ||
    props.status[StatusKey.KIALI_CORE_COMMIT_HASH] === 'unknown'
      ? props.status[StatusKey.KIALI_CORE_VERSION]
      : `${props.status[StatusKey.KIALI_CORE_VERSION]} (${
          props.status[StatusKey.KIALI_CORE_COMMIT_HASH]
        })`;
  const containerVersion = props.status[StatusKey.KIALI_CONTAINER_VERSION];
  const meshVersion = props.status[StatusKey.MESH_NAME]
    ? `${props.status[StatusKey.MESH_NAME]} ${
        props.status[StatusKey.MESH_VERSION] || ''
      }`
    : 'Unknown';

  return (
    <Dialog
      open={props.showModal}
      onClose={() => props.setShowModal(false)}
      aria-labelledby="Kiali"
      aria-describedby="Kiali"
      fullWidth
    >
      <DialogTitle style={{ backgroundColor: '#030303' }}>
        <KialiLogo />
        <IconButton
          onClick={() => props.setShowModal(false)}
          className={closeButton}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent style={{ backgroundColor: '#030303', color: 'white' }}>
        <Typography className={textContentStyle}>
          <Typography variant="h4">Kiali</Typography>
          <Grid container>
            <Grid item xs={4}>
              Kiali
            </Grid>
            <Grid item xs={8}>
              {coreVersion || 'Unknown'}
            </Grid>
            <Grid item xs={4}>
              Kiali Container
            </Grid>
            <Grid item xs={8}>
              {containerVersion || 'Unknown'}
            </Grid>
            <Grid item xs={4}>
              Service Mesh
            </Grid>
            <Grid item xs={8}>
              {meshVersion || 'Unknown'}
            </Grid>
          </Grid>
        </Typography>
        {props.warningMessages.length > 0 && (
          <Card style={{ margin: '20px' }}>
            <CardHeader
              title={
                <Typography>
                  {props.warningMessages.length} warnings.{' '}
                  <Link
                    to=""
                    onClick={() => setShowWarnings(!showWarnings)}
                    style={{ color: '#2b9af3' }}
                  >
                    ({showWarnings ? 'Close' : 'See'} them)
                  </Link>
                </Typography>
              }
            />
            <CardContent>
              <Collapse in={showWarnings}>
                {props.warningMessages.map(warn => (
                  <Alert
                    key={`warning_msg_${warn.concat('_')}`}
                    severity="warning"
                    style={{ marginTop: '1em' }}
                  >
                    {warn}
                  </Alert>
                ))}
              </Collapse>
            </CardContent>
          </Card>
        )}
        <Typography className={textContentStyle}>
          <Typography variant="h6">Components</Typography>
          <Grid container>{props?.externalServices.map(renderComponent)}</Grid>
        </Typography>
      </DialogContent>
      <DialogActions style={{ backgroundColor: '#030303', display: 'block' }}>
        {renderWebsiteLink()}
        {renderProjectLink()}
      </DialogActions>
    </Dialog>
  );
};
