import React from 'react';

import { useApi } from '@backstage/core-plugin-api';
import { kubernetesProxyApiRef } from '@backstage/plugin-kubernetes';

import { V1Pod } from '@kubernetes/client-node';
import { createStyles, Link, makeStyles, Theme } from '@material-ui/core';
import { DownloadIcon } from '@patternfly/react-icons';
import classNames from 'classnames';

import { downloadLogFile } from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { ContainerScope } from '../../hooks/usePodLogsOfPipelineRun';
import { TektonResourcesContextData } from '../../types/types';
import { getPodLogs } from '../../utils/log-downloader-utils';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    downloadAction: {
      position: 'relative',
      marginBottom: 'var(--pf-v5-global--spacer--sm)',
      color: theme.palette.grey[700],
      cursor: 'pointer',
    },
    buttonDisabled: {
      color: theme.palette.grey[400],
      cursor: 'not-allowed',
    },
  }),
);

const PodLogsDownloadLink: React.FC<{
  pods: V1Pod[];
  fileName: string;
  downloadTitle: string;
}> = ({ pods, fileName, downloadTitle }): React.ReactElement => {
  const classes = useStyles();
  const [downloading, setDownloading] = React.useState<boolean>(false);
  const kubernetesProxyApi = useApi(kubernetesProxyApiRef);

  const { clusters, selectedCluster } =
    React.useContext<TektonResourcesContextData>(TektonResourcesContext);
  const currCluster =
    (clusters.length > 0 && clusters[selectedCluster || 0]) || '';

  const getLogs = (podScope: ContainerScope): Promise<{ text: string }> => {
    const { podName, podNamespace, containerName, clusterName } = podScope;
    return kubernetesProxyApi.getPodLogs({
      podName: podName,
      namespace: podNamespace,
      containerName: containerName,
      clusterName: clusterName,
    });
  };

  return (
    <Link
      component="button"
      variant="body2"
      underline="none"
      disabled={downloading}
      onClick={() => {
        setDownloading(true);
        getPodLogs(pods, getLogs, currCluster).then((logs: string) => {
          setDownloading(false);
          downloadLogFile(logs || '', fileName);
        });
      }}
      className={classNames(classes.downloadAction, {
        [classes.buttonDisabled]: downloading,
      })}
    >
      <DownloadIcon title="Download logs" /> {downloadTitle || 'Download '}
    </Link>
  );
};
export default PodLogsDownloadLink;
