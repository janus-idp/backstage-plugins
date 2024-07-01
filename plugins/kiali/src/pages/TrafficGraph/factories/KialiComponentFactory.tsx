import {
  ComponentFactory,
  DefaultGroup,
  GraphComponent,
  ModelKind,
  withPanZoom,
  withSelection,
} from '@patternfly/react-topology';

import { KialiEdge } from '../styles/KialiEdge';
import { KialiNode } from '../styles/KialiNode';

export const KialiComponentFactory: ComponentFactory = (
  kind: ModelKind,
  type: string,
) => {
  switch (type) {
    case 'group':
      return DefaultGroup;
    default:
      switch (kind) {
        case ModelKind.graph:
          return withPanZoom()(GraphComponent);
        case ModelKind.node:
          return KialiNode as any;
        case ModelKind.edge:
          return withSelection({ multiSelect: false, controlled: false })(
            KialiEdge as any,
          );
        default:
          return undefined;
      }
  }
};
