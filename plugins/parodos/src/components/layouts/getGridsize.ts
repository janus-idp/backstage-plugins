import { Grid, type GridSize } from '@material-ui/core';
import { UiSchema } from '@rjsf/utils';
import { PropsFromComponent } from '../types';

type GridProps = PropsFromComponent<typeof Grid>;

type ResponsiveGridSizes = Pick<GridProps, 'xs' | 'md' | 'lg' | 'xl'>;

function isGridSize(input?: unknown): input is GridSize {
  return typeof input === 'number';
}

export function getGridSize(uiSchema: UiSchema): ResponsiveGridSizes {
  const gridSize = uiSchema?.['ui:xs'];
  if (isGridSize(gridSize)) {
    return { xs: gridSize };
  }

  return {
    xs: 12,
    md: 6,
    lg: 4,
  };
}
