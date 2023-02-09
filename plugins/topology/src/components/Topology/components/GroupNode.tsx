import * as React from 'react';
import {
  DefaultGroup,
  GraphElement,
  isNode,
  Node,
  observer,
  ScaleDetailsLevel,
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';
import AlternateIcon from '@patternfly/react-icons/dist/esm/icons/regions-icon';
import DefaultIcon from '@patternfly/react-icons/dist/esm/icons/builder-image-icon';
import useDetailsLevel from '@patternfly/react-topology/dist/esm/hooks/useDetailsLevel';

const ICON_PADDING = 20;
const collapsedWidth = 75;
const collapsedHeight = 75;

export enum DataTypes {
  Default,
  Alternate,
}

type GroupNodeProps = {
  element?: GraphElement;
} & Partial<WithSelectionProps & WithDragNodeProps>;

const GroupNode: React.FunctionComponent<GroupNodeProps> = ({
  element,
  ...rest
}) => {
  if (!element || !isNode(element)) {
    return null;
  }
  const data = element.getData();
  const detailsLevel = useDetailsLevel();

  const getTypeIcon = (dataType?: DataTypes): any => {
    switch (dataType) {
      case DataTypes.Alternate:
        return AlternateIcon;
      default:
        return DefaultIcon;
    }
  };

  const renderIcon = (): React.ReactNode => {
    const iconSize =
      Math.min(collapsedWidth, collapsedHeight) - ICON_PADDING * 2;
    const Component = getTypeIcon(data.dataType);

    return (
      <g
        transform={`translate(${(collapsedWidth - iconSize) / 2}, ${
          (collapsedHeight - iconSize) / 2
        })`}
      >
        <Component
          style={{ color: '#393F44' }}
          width={iconSize}
          height={iconSize}
        />
      </g>
    );
  };

  const passedData = React.useMemo(() => {
    const newData = { ...data };
    Object.keys(newData).forEach(key => {
      if (newData[key] === undefined) {
        delete newData[key];
      }
    });
    return newData;
  }, [data]);

  return (
    <DefaultGroup
      element={element}
      collapsedWidth={collapsedWidth}
      collapsedHeight={collapsedHeight}
      showLabel={detailsLevel === ScaleDetailsLevel.high}
      {...rest}
      {...passedData}
    >
      {(element as Node).isCollapsed() ? renderIcon() : null}
    </DefaultGroup>
  );
};

export default observer(GroupNode);
