import React from 'react';
import { Content, HeaderTabs, Tabs, Page } from '@backstage/core-components';
import { useLocation } from 'react-router-dom';
import { PageHeader } from './PageHeader';
import { navigationMap, pluginRoutePrefix } from './PluginRouter';

export const TabLabel: React.FC<{ icon?: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <>
    {icon}
    {label}
  </>
);

export const ParodosPage: React.FC = ({ children }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);
  const { pathname } = useLocation();

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
        tabs={navigationMap.map(({ label, icon }, index) => ({
          id: index.toString(),
          label: (
            <TabLabel icon={icon} label={label} />
          ) as unknown as string /* Hack, since HeaderTabs accept string only. Contrary to Tabs coponent. */,

          // To consider: we can use Content here over react-router, the behavior would be smoother
        }))}
      />

      <Content>{children}</Content>
    </Page>
  );
};
