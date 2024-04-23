import * as React from 'react';

import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core';

import { argoCDApiRef } from '../../api';
import { useApplications } from '../../hooks/useApplications';
import { useArgocdConfig } from '../../hooks/useArgocdConfig';
import { Application, Revision } from '../../types';
import { getAppSelector, getUniqueRevisions } from '../../utils/utils';
import DeploymentLifecycleCard from './DeploymentLifecycleCard';
import DeploymentLifecycleDrawer from './DeploymentLifecycleDrawer';

const useDrawerStyles = makeStyles<Theme>(theme =>
  createStyles({
    lifecycle: {
      display: 'flex',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      background:
        theme.palette.type === 'dark'
          ? theme.palette.grey[700]
          : theme.palette.grey[200],
      color: 'black',
      margin: '1px solid red',
      padding: '20px',
      borderRadius: '10px',
    },
  }),
);

const DeploymentLifecycle = () => {
  const { entity } = useEntity();
  const classes = useDrawerStyles();

  const api = useApi(argoCDApiRef);

  const { instanceName, intervalMs } = useArgocdConfig();
  const { apps, loading, error } = useApplications({
    instanceName,
    intervalMs,
    appSelector: encodeURIComponent(getAppSelector(entity)),
  });

  const [open, setOpen] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState<string>();
  const [, setRevisions] = React.useState<{
    [key: string]: Revision;
  }>();
  const revisionCache = React.useRef<{ [key: string]: Revision }>({});

  const uniqRevisions: string[] = React.useMemo(
    () => getUniqueRevisions(apps),
    [apps],
  );

  React.useEffect(() => {
    if (uniqRevisions.length !== Object.keys(revisionCache.current).length) {
      api
        .getRevisionDetailsList({
          apps: apps,
          instanceName,
          revisionIDs: uniqRevisions,
        })
        .then(data => {
          uniqRevisions.forEach((rev, i) => {
            revisionCache.current[rev] = data[i];
          });
          setRevisions(revisionCache.current);
        })
        .catch(e => {
          // eslint-disable-next-line no-console
          console.warn(e);
        });
    }
  }, [api, apps, entity, instanceName, uniqRevisions]);

  const toggleDrawer = () => setOpen(e => !e);

  const activeApp = apps.find(a => a.metadata.name === activeItem);

  if (loading) {
    return (
      <div data-testid="argocd-loader">
        <Progress />
      </div>
    );
  } else if (error) {
    return <ResponseErrorPanel data-testid="error-panel" error={error} />;
  }

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Deployment lifecycle
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Review deployed components/systems in the namespace using ArgoCD plugin
      </Typography>

      <div className={classes.lifecycle}>
        {apps.map((app: Application, idx: number) => (
          <DeploymentLifecycleCard
            app={app}
            key={app.metadata.uid ?? idx}
            revisionsMap={revisionCache.current}
            onclick={() => {
              toggleDrawer();
              setActiveItem(app.metadata.name);
            }}
          />
        ))}
      </div>

      <DeploymentLifecycleDrawer
        app={activeApp}
        isOpen={open}
        onClose={() => setOpen(false)}
        revisionsMap={revisionCache.current}
      />
    </>
  );
};

export default DeploymentLifecycle;
