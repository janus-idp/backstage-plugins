import React, { forwardRef, useCallback, useMemo, type ReactNode } from 'react';
import { Content, HeaderTabs, Page } from '@backstage/core-components';
import { useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';
import { PageHeader } from './PageHeader';
import {
  AssessmentIcon,
  DeployIcon,
  NotificationIcon,
  ProjectsIcon,
  TrainingIcon,
  MetricsIcon,
} from './icons';
import type { ProjectType, PropsFromComponent } from './types';
import { useNavigate } from 'react-router-dom';
import StarIcon from '@material-ui/icons/Star';
import { useBackendUrl } from './api/useBackendUrl';
import useAsync from 'react-use/lib/useAsync';
import * as urls from '../urls';
import { ErrorMessage } from './errors/ErrorMessage';

export const pluginRoutePrefix = '/parodos';

export const navigationMap = [
  { label: 'Projects', routes: ['/project-overview'], icon: <ProjectsIcon /> },
  {
    label: 'Assessment',
    routes: ['/workflow', '/onboarding/'],
    icon: <AssessmentIcon />,
  },

  { label: 'Deploy', routes: ['/Deploy'], icon: <DeployIcon /> },
  {
    label: 'Notification',
    routes: ['/notification'],
    icon: <NotificationIcon />,
  },
  { label: 'Training', routes: ['/training'], icon: <TrainingIcon /> },
  { label: 'Metrics', routes: ['/metrics'], icon: <MetricsIcon /> },
];

const useStyles = makeStyles({
  highlightedTab: {
    position: 'absolute',
    top: '1rem',
    right: 0,
    color: '#F70D1A',
  },
});

interface TabLabelProps {
  icon: ReactNode;
  highlighted: boolean;
  children: ReactNode;
}

export const TabLabel = forwardRef<HTMLSpanElement, TabLabelProps>(
  ({ children, icon, highlighted, ...props }, ref) => {
    const styles = useStyles();

    return (
      <span {...props} ref={ref}>
        {icon}
        {highlighted && <StarIcon className={styles.highlightedTab} />}
        {children}
      </span>
    );
  },
);

// Unfortunately backstage do not export the props type for <Content />
type ContentProps = PropsFromComponent<typeof Content>;

type ParodosPageProps = ContentProps;

export const ParodosPage: React.FC<ParodosPageProps> = ({
  children,
  ...props
}) => {
  const { pathname } = useLocation();
  const [isProject, setIsProject] = React.useState(true);
  const backendUrl = useBackendUrl();
  const selectedTab = useMemo(
    () =>
      navigationMap.findIndex(({ routes }) =>
        routes.find(route => pathname.includes(route)),
      ),
    [pathname],
  );

  const { error } = useAsync(async () => {
    const response = await fetch(`${backendUrl}${urls.Projects}`);

    const receivedProjects = (await response.json()) as ProjectType[];
    setIsProject(receivedProjects.length > 0);
  }, [backendUrl]);

  const navigate = useNavigate();

  const tabs = useMemo(
    () =>
      navigationMap.map(({ label }, index) => {
        // TODO: this should be coming from state with recoil or something
        const highlighted = selectedTab === 0 && index === 1 && !isProject;
        return {
          id: index.toString(),
          label,
          tabProps: {
            component: (p: TabLabelProps) => (
              <TabLabel
                {...p}
                highlighted={highlighted}
                icon={navigationMap[index].icon}
              />
            ),
          },
        };
      }),
    [isProject, selectedTab],
  );

  const onTabChange = useCallback(
    tabIndex => {
      const { routes } = navigationMap[tabIndex];
      navigate(`${pluginRoutePrefix}${routes[0]}`);
    },
    [navigate],
  );

  return (
    <Page themeId="tool">
      <PageHeader />
      <HeaderTabs
        selectedIndex={selectedTab}
        onChange={onTabChange}
        tabs={tabs}
      />
      <Content {...props}>
        {error && <ErrorMessage error={error} />}
        {children}
      </Content>
    </Page>
  );
};
