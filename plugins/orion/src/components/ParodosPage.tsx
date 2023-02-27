import React from 'react';
import { Content, HeaderTabs, Page } from '@backstage/core-components';
import { useLocation } from 'react-router-dom';
import StarIcon from '@material-ui/icons/Star';
import { makeStyles } from '@material-ui/core';
import { PageHeader } from './PageHeader';
import {
  AssessmentIcon,
  OnboardingIcon,
  DeployIcon,
  NotificationIcon,
  ProjectsIcon,
  TrainingIcon,
  MetricsIcon,
} from './icons';
import { ProjectType } from './types';
import { useBackendUrl } from './api';

export const pluginRoutePrefix = '/parodos';

export const navigationMap = [
  { label: 'Projects', route: '/project-overview', icon: <ProjectsIcon /> },
  { label: 'Assessment', route: '/workflow', icon: <AssessmentIcon /> },
  { label: 'Onboarding', route: '/onboarding', icon: <OnboardingIcon /> },
  { label: 'Deploy', route: '/Deploy', icon: <DeployIcon /> },
  { label: 'Notification', route: '/notification', icon: <NotificationIcon /> },
  { label: 'Training', route: '/training', icon: <TrainingIcon /> },
  { label: 'Metrics', route: '/metrics', icon: <MetricsIcon /> },
];

const useStyles = makeStyles({
  highlightedTab: {
    position: 'absolute',
    top: '1rem',
    right: 0,
    color: '#F70D1A',
  },
});

export const TabLabel: React.FC<{
  icon?: React.ReactNode;
  label: string;
  highlighted?: boolean;
}> = ({ icon, label, highlighted }) => {
  const styles = useStyles();

  return (
    <>
      {icon}
      {highlighted && <StarIcon className={styles.highlightedTab} />}
      {label}
    </>
  );
};
export const ParodosPage: React.FC = ({ children }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const { pathname } = useLocation();
  const [isProject, setIsProject] = React.useState(true);
  const backendUrl = useBackendUrl();

  React.useEffect(() => {
    const doItAsync = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/proxy/parodos/projects`,
        );
        const receivedProjects = (await response.json()) as ProjectType[];
        setIsProject(receivedProjects.length > 0);
      } catch (e) {
        setIsProject(false);
        // TODO: render error
      }
    };
    doItAsync();
  }, [setIsProject, backendUrl]);

  React.useEffect(() => {
    const index =
      navigationMap.findIndex(({ route }) => pathname.includes(route)) || 0;
    setSelectedTab(index);
  }, [pathname]);

  const onChangeTab = (index: number) => {
    setSelectedTab(index);
    window.location.href = `${pluginRoutePrefix}${navigationMap[index].route}`;
  };

  return (
    <Page themeId="tool">
      <PageHeader />
      <HeaderTabs
        selectedIndex={selectedTab}
        onChange={onChangeTab}
        tabs={navigationMap.map(({ label, icon }, index) => {
          const highlighted =
            selectedTab === 0 /* When on Projects tab only */ &&
            index === 1 /* for the Assessment tab only */ &&
            !isProject;

          return {
            id: index.toString(),
            label: (
              <TabLabel icon={icon} label={label} highlighted={highlighted} />
            ) as unknown as string /* Hack, since HeaderTabs accept string only. Contrary to Tabs coponent. */,

            // To consider: we can use Content here over react-router, the behavior would be smoother
          };
        })}
      />

      <Content>{children}</Content>
    </Page>
  );
};
