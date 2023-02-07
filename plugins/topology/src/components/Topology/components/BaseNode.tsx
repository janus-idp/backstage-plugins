import * as React from 'react';
import {
  BadgeLocation,
  DEFAULT_LAYER,
  DefaultNode,
  Layer,
  Node,
  NodeStatus,
  observer,
  ScaleDetailsLevel,
  TOP_LAYER,
  useCombineRefs,
  WithContextMenuProps,
  WithDndDropProps,
  WithDragNodeProps,
  WithSelectionProps,
  useHover,
  WithCreateConnectorProps,
} from '@patternfly/react-topology';

type BaseNodeProps = {
  className?: string;
  innerRadius?: number;
  icon?: string;
  kind?: string;
  labelIconClass?: string; // Icon to show in label
  labelIcon?: React.ReactNode;
  labelIconPadding?: number;
  badge?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  badgeBorderColor?: string;
  badgeClassName?: string;
  badgeLocation?: BadgeLocation;
  children?: React.ReactNode;
  attachments?: React.ReactNode;
  element: Node;
  hoverRef?: (node: Element) => () => void;
  dragging?: boolean;
  dropTarget?: boolean;
  canDrop?: boolean;
  nodeStatus?: NodeStatus;
  showStatusBackground?: boolean;
  alertVariant?: NodeStatus;
} & Partial<WithSelectionProps> &
  Partial<WithDragNodeProps> &
  Partial<WithDndDropProps> &
  Partial<WithContextMenuProps> &
  Partial<WithCreateConnectorProps>;

const BaseNode: React.FC<BaseNodeProps> = ({
  className,
  innerRadius = 10,
  icon,
  kind,
  element,
  hoverRef,
  children,
  onShowCreateConnector,
  onContextMenu,
  contextMenuOpen,
  alertVariant,
  ...rest
}) => {
  const [hover, internalHoverRef] = useHover();
  const nodeHoverRefs = useCombineRefs(
    internalHoverRef,
    hoverRef as React.Ref<Element>,
  );
  const { width, height } = element.getDimensions();
  const cx = width / 2;
  const cy = height / 2;
  const iconRadius = innerRadius * 0.9;

  const detailsLevel = element.getController().getGraph().getDetailsLevel();
  const showDetails =
    hover || contextMenuOpen || detailsLevel !== ScaleDetailsLevel.low;

  return (
    <Layer id={hover || contextMenuOpen ? TOP_LAYER : DEFAULT_LAYER}>
      <g
        ref={nodeHoverRefs as React.LegacyRef<SVGGElement>}
        data-test-id={element.getLabel()}
      >
        <DefaultNode
          element={element}
          showLabel
          scaleNode={
            (hover || contextMenuOpen) &&
            detailsLevel !== ScaleDetailsLevel.high
          }
          onContextMenu={onContextMenu}
          contextMenuOpen={contextMenuOpen}
          showStatusBackground={!showDetails}
          {...rest}
        >
          <g data-test-id="base-node-handler">
            {icon && showDetails && (
              <>
                <circle
                  fill="var(--pf-global--palette--white)"
                  cx={cx}
                  cy={cy}
                  r={innerRadius + 6}
                />
                <image
                  x={cx - iconRadius}
                  y={cy - iconRadius}
                  width={iconRadius * 2}
                  height={iconRadius * 2}
                  xlinkHref={icon}
                />
              </>
            )}
            {showDetails && children}
          </g>
        </DefaultNode>
      </g>
    </Layer>
  );
};

export default observer(BaseNode);
