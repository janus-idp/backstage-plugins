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
  WithDragNodeProps,
  WithSelectionProps,
  useHover,
} from '@patternfly/react-topology';
import { getKindStringAndAbbreviation } from '../../utils/workload-node-utils';

type BaseNodeProps = {
  className?: string;
  innerRadius?: number;
  icon?: string;
  kind?: string;
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
  nodeStatus?: NodeStatus;
  showStatusBackground?: boolean;
  alertVariant?: NodeStatus;
} & Partial<WithSelectionProps> &
  Partial<WithDragNodeProps>;

const BaseNode: React.FC<BaseNodeProps> = ({
  className,
  innerRadius = 10,
  icon,
  kind,
  element,
  hoverRef,
  children,
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
  const showDetails = hover || detailsLevel !== ScaleDetailsLevel.low;
  const kindData = kind && getKindStringAndAbbreviation(kind);

  return (
    <Layer
      id={
        hover && detailsLevel !== ScaleDetailsLevel.high
          ? TOP_LAYER
          : DEFAULT_LAYER
      }
    >
      <g
        ref={nodeHoverRefs as React.LegacyRef<SVGGElement>}
        data-test-id={element.getLabel()}
      >
        <DefaultNode
          element={element}
          showLabel
          scaleNode={hover && detailsLevel !== ScaleDetailsLevel.high}
          badge={kindData && kindData.kindAbbr}
          badgeColor={kindData && kindData.kindColor}
          showStatusBackground={!showDetails}
          className={className}
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
