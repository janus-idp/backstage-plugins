import * as React from 'react';
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import { Header, Page } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { usePipelineRunObjects } from '@jquad-group/plugin-tekton-pipelines';
import { useTheme } from '@material-ui/core/styles';

const THEME_DARK = 'dark';
const THEME_DARK_CLASS = 'pf-theme-dark';

export const TektonComponent = () => {
  const {
    palette: { type },
  } = useTheme();

  React.useEffect(() => {
    const htmlTagElement = document.documentElement;
    if (type === THEME_DARK) {
      htmlTagElement.classList.add(THEME_DARK_CLASS);
    } else {
      htmlTagElement.classList.remove(THEME_DARK_CLASS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const { entity } = useEntity();
  const data = usePipelineRunObjects(entity);
  // This is just show the data is being fetched, remove this line when you start working on the component
  // eslint-disable-next-line no-console
  console.log('Tekton data', data);

  return (
    <Page themeId="tool">
      <Header
        title="Pipeline Visualization!"
        subtitle="Visualize PipelineRuns/TaskRuns"
      />
    </Page>
  );
};
