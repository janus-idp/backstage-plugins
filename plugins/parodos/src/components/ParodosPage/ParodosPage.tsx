import React, { useCallback, useMemo, type FC } from 'react';
import { Content, HeaderTabs, Page } from '@backstage/core-components';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../PageHeader';
import type { PropsFromComponent } from '../types';
import { useNavigate } from 'react-router-dom';
import { TabLabel, TabLabelProps } from './TabLabel';
import { navigationMap, pluginRoutePrefix } from './navigationMap';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { ErrorMessage } from '../errors/ErrorMessage';

// Unfortunately backstage do not export the props type for <Content />
type ContentProps = PropsFromComponent<typeof Content>;

type ParodosPageProps = ContentProps;

export const ParodosPage: FC<ParodosPageProps> = ({ children, ...props }) => {
  const { pathname } = useLocation();
  const selectedTab = useMemo(
    () =>
      navigationMap.findIndex(({ routes }) =>
        routes.find(route => pathname.includes(route)),
      ),
    [pathname],
  );
  const hasProjects = useStore(state => state.hasProjects());
  const error = useStore(state => state.error());
  const navigate = useNavigate();

  const tabs = useMemo(
    () =>
      navigationMap.map(({ label }, index) => {
        const highlighted = selectedTab === 0 && index === 1 && !hasProjects;

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
    [hasProjects, selectedTab],
  );

  const onChangeTab = useCallback(
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
        onChange={onChangeTab}
        tabs={tabs}
      />
      <Content {...props}>
        {error && <ErrorMessage error={error as Error} />}
        {children}
      </Content>
    </Page>
  );
};
