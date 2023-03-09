import * as React from 'react';
import { observer } from 'mobx-react';
import {
  DEFAULT_LAYER,
  DEFAULT_WHEN_OFFSET,
  Layer,
  Node,
  ScaleDetailsLevel,
  TaskNode,
  TOP_LAYER,
  useDetailsLevel,
  useHover,
  WhenDecorator,
  WithContextMenuProps,
  WithSelectionProps,
} from '@patternfly/react-topology';

type DemoTaskNodeProps = {
  element: Node;
} & WithContextMenuProps &
  WithSelectionProps;

const DemoTaskNode: any = ({
  element,
  onContextMenu,
  contextMenuOpen,
  ...rest
}: DemoTaskNodeProps) => {
  const data = element.getData();
  const [hover, hoverRef] = useHover();
  const detailsLevel = useDetailsLevel();

  const passedData = React.useMemo(() => {
    const newData = { ...data };
    Object.keys(newData).forEach(key => {
      if (newData[key] === undefined) {
        delete newData[key];
      }
    });
    return newData;
  }, [data]);

  const hasTaskIcon = !!(data.taskIconClass || data.taskIcon);
  const whenDecorator = data.whenStatus ? (
    <WhenDecorator
      element={element}
      status={data.whenStatus}
      leftOffset={
        hasTaskIcon
          ? DEFAULT_WHEN_OFFSET + (element.getBounds().height - 4) * 0.85
          : DEFAULT_WHEN_OFFSET
      }
    />
  ) : null;

  return (
    <Layer
      id={
        detailsLevel !== ScaleDetailsLevel.high && hover
          ? TOP_LAYER
          : DEFAULT_LAYER
      }
    >
      <TaskNode
        ref={hoverRef}
        element={element}
        scaleNode={hover && detailsLevel !== ScaleDetailsLevel.high}
        hideDetailsAtMedium
        {...passedData}
        {...rest}
        truncateLength={20}
      >
        {whenDecorator}
      </TaskNode>
    </Layer>
  );
};

export default observer(DemoTaskNode);
