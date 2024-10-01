import React from 'react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { useDarkTheme } from '../../hooks/useDarkTheme';
import { useTektonObjectsResponse } from '../../hooks/useTektonObjectsResponse';
import { useTektonViewPermission } from '../../hooks/useTektonViewPermission';
import { ModelsPlural } from '../../models';
import PermissionAlert from '../common/PermissionAlert';
import PipelineRunList from '../PipelineRunList/PipelineRunList';

import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';

const savedStylesheets = new Set<HTMLLinkElement>();

export const TektonCIComponent = () => {
  useDarkTheme();

  const shadowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const scalprumStyles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    ).filter(link =>
      link.attributes
        .getNamedItem('href')
        ?.value?.includes('backstage-plugin-tekton'),
    );

    scalprumStyles.forEach(link =>
      savedStylesheets.add(link as HTMLLinkElement),
    );

    savedStylesheets.forEach(link => {
      if (!document.head.contains(link)) {
        document.head.appendChild(link);
      }
    });
    return () => {
      savedStylesheets.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  const watchedResources = [
    ModelsPlural.pipelineruns,
    ModelsPlural.taskruns,
    ModelsPlural.pods,
  ];
  const tektonResourcesContextData = useTektonObjectsResponse(watchedResources);
  const hasViewPermission = useTektonViewPermission();

  if (!hasViewPermission) {
    return <PermissionAlert />;
  }
  return (
    <TektonResourcesContext.Provider value={tektonResourcesContextData}>
      <div ref={shadowRef}>
        <PipelineRunList />
      </div>
    </TektonResourcesContext.Provider>
  );
};
