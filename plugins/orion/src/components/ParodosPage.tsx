import React from 'react';
import { Content, HeaderTabs, Page } from '@backstage/core-components';
import { useLocation } from 'react-router-dom';
import StarIcon from '@material-ui/icons/Star';
import { makeStyles } from '@material-ui/core';
import { PageHeader } from './PageHeader';
import {
  AssessmentIcon,
  NotificationsIcon,
  ProjectsIcon,
  TrainingIcon,
} from './icons';
import { mockProjects } from './projectOverview/mockData';

export const pluginRoutePrefix = '/parodos';

export const navigationMap = [
  { label: 'Projects', route: '/project-overview', icon: <ProjectsIcon /> },
  { label: 'Assessment', route: '/workflow', icon: <AssessmentIcon /> },
  {
    label: 'Notifications',
    route: '/notification',
    icon: <NotificationsIcon />,
  },
  { label: 'Training', route: '/training', icon: <TrainingIcon /> },
  { label: 'Onboarding', route: '/onboarding', icon: <AssessmentIcon /> },
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

  React.useEffect(() => {
    // TODO: load the data
    setIsProject(mockProjects.length > 0);
  }, [setIsProject]);

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
