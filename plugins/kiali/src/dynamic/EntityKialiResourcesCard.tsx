import * as React from 'react';
import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  CardTab,
  CodeSnippet,
  EmptyState,
  TabbedCard,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { Box } from '@material-ui/core';

import { AppListPage } from '../pages/AppList/AppListPage';
import { ServiceListPage } from '../pages/ServiceList/ServiceListPage';
import { WorkloadListPage } from '../pages/WorkloadList/WorkloadListPage';
import { DRAWER } from '../types/types';

const tabStyle: React.CSSProperties = {
  overflowY: 'scroll',
  maxHeight: '400px',
};

const tabs = ['workload', 'service', 'application'];

export const EntityKialiResourcesCard = () => {
  const { entity } = useEntity();
  const location = useLocation();
  const [element, setElement] = React.useState<string>();
  const prevElement = useRef(element);
  const [renderCount, setRenderCount] = React.useState(0);

  const getInitValue = (): string => {
    const hash = location.hash.replace(/^#,?\s*/, '');
    const data = hash.split('/');

    const close = document.getElementById('close_drawer');
    if (close) {
      close.click();
    }

    if (data.length > 1 && data[1] !== element) {
      setElement(data[1]);
    }
    if (tabs.includes(data[0])) {
      return data[0];
    }
    return tabs[0];
  };
  const [value, setValue] = React.useState<string | number>(getInitValue());

  const navigate = useNavigate();

  const handleChange = (
    _: React.ChangeEvent<{}>,
    newValue: string | number,
  ) => {
    setValue(newValue);
    navigate(`#${newValue}`);
  };

  React.useEffect(() => {
    // This time out is needed to have rendered the context and be able to call the element to open the drawer
    const timeout = setTimeout(() => {
      setRenderCount(prevCount => prevCount + 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  React.useEffect(() => {
    const val = getInitValue();
    if (val !== value) {
      setValue(val);
      setTimeout(() => {
        setRenderCount(prevCount => prevCount + 1);
      }, 1000);
      return;
    }

    if (element && element !== prevElement.current && renderCount > 0) {
      const drawer = document.getElementById(`drawer_${element}`);
      if (drawer) {
        drawer.click();
      }
      prevElement.current = element;
    }
  }, [element, getInitValue, renderCount, value]);

  return !entity ? (
    <EmptyState
      missing="data"
      title="No resources to show with these annotations"
      description={
        <>
          Kiali detected the annotations
          <div style={{ marginTop: '40px' }}>
            This is the entity loaded.
            <Box style={{ marginTop: '10px' }}>
              <CodeSnippet
                text={JSON.stringify(entity, null, 2)}
                language="yaml"
                showLineNumbers
                customStyle={{ background: 'inherit', fontSize: '115%' }}
              />
            </Box>
          </div>
        </>
      }
    />
  ) : (
    <TabbedCard
      title="Service Mesh Resources"
      onChange={handleChange}
      value={value}
    >
      <CardTab label="Workloads" value="workload">
        <div style={tabStyle}>
          <WorkloadListPage view={DRAWER} entity={entity} />
        </div>
      </CardTab>
      <CardTab label="Services" value="service">
        <div style={tabStyle}>
          <ServiceListPage view={DRAWER} entity={entity} />
        </div>
      </CardTab>
      <CardTab label="Applications" value="application">
        <div style={tabStyle}>
          <AppListPage view={DRAWER} entity={entity} />
        </div>
      </CardTab>
    </TabbedCard>
  );
};
