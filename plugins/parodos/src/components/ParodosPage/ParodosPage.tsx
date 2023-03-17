import React, { useCallback, useMemo, useState, type FC } from 'react';
import { Content, HeaderTabs, Page } from '@backstage/core-components';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../PageHeader';
import type { ProjectType, PropsFromComponent } from '../types';
import { useNavigate } from 'react-router-dom';
import { useBackendUrl } from '../api/useBackendUrl';
import useAsync from 'react-use/lib/useAsync';
import * as urls from '../../urls';
import { ErrorMessage } from '../errors/ErrorMessage';
import { TabLabel, TabLabelProps } from './TabLabel';
import { navigationMap, pluginRoutePrefix } from './navigationMap';

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
  // TODO: this should be coming from application state with mobx, recoil or something
  const [hasProjects, setHasProjects] = useState(true);
  const backendUrl = useBackendUrl();
  const navigate = useNavigate();

  const { error } = useAsync(async () => {
    const response = await fetch(`${backendUrl}${urls.Projects}`);

    const receivedProjects = (await response.json()) as ProjectType[];
    setHasProjects(receivedProjects.length > 0);
  }, [backendUrl]);

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
        {error && <ErrorMessage error={error} />}
        {children}
      </Content>
    </Page>
  );
};
