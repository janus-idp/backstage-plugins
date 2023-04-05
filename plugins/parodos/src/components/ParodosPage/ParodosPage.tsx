import React, { useCallback, useEffect, useMemo, type FC } from 'react';
import { Content, HeaderTabs, Page } from '@backstage/core-components';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../PageHeader';
import type { PropsFromComponent } from '../types';
import { useNavigate } from 'react-router-dom';
import { tabLabelCreator } from './TabLabel';
import { navigationMap, pluginRoutePrefix } from './navigationMap';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { ErrorMessage } from '../errors/ErrorMessage';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';

// Unfortunately backstage do not export the props type for <Content />
type ContentProps = PropsFromComponent<typeof Content>;

type ParodosPageProps = ContentProps;

export const ParodosPage: FC<ParodosPageProps> = ({ children, ...props }) => {
  const { pathname } = useLocation();
  const selectedTab = useMemo(
    () =>
      Math.max(
        navigationMap.findIndex(({ routes }) =>
          routes.find(route => pathname.includes(route)),
        ),
        0,
      ),
    [pathname],
  );
  const hasProjects = useStore(state => state.hasProjects());
  const navigate = useNavigate();

  const error = useStore(state => state.error());
  const identity = useApi(identityApiRef);
  useEffect(() => {
    if (error?.status === 401) {
      // unmatching or expired identity

      // eslint-disable-next-line no-console
      console.info('Signing out due to error: ', error);

      identity.signOut().then(
        // overriding default behavior to avoid navigation to the '/' page
        // We can render the error and let the user to explicitely perform the "Sign out". By having that, the user can choose to navigate elsewhere instead.
        () => window.location.reload(),
      );
    }
  });

  const tabs = useMemo(
    () =>
      navigationMap.map(({ label }, index) => {
        const highlighted = selectedTab === 0 && index === 1 && !hasProjects;

        return {
          id: index.toString(),
          label,
          tabProps: {
            component: tabLabelCreator({
              icon: navigationMap[index].icon,
              highlighted,
            }),
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
