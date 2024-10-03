import React from 'react';

import { makeStyles } from '@material-ui/core';
import {
  WithDragNodeProps,
  WithSelectionProps,
} from '@patternfly/react-topology';

import { RESOURCE_NAME_TRUNCATE_LENGTH } from '../../const';
import VirtualMachineIcon from '../Icons/VirtualMachineIcon';
import BaseNode from './BaseNode';

const VM_STATUS_GAP = 7;
const VM_STATUS_WIDTH = 7;
const VM_STATUS_RADIUS = 7;
type VmNodeProps = {
  element: any;
  hover?: boolean;
  dragging?: boolean;
  edgeDragging?: boolean;
  highlight?: boolean;
  canDrop?: boolean;
  dropTarget?: boolean;
  children: any;
} & Partial<WithSelectionProps & WithDragNodeProps>;

const VmNode = ({
  element,
  onSelect,
  canDrop,
  dropTarget,
  children,
  ...rest
}: VmNodeProps) => {
  const { width, height } = element.getBounds();
  const vmData = element.getData().data;
  const { kind, osImage } = vmData;
  const iconRadius = Math.min(width, height) * 0.25;

  const onNodeSelect = (e: React.MouseEvent) => {
    const params = new URLSearchParams(window.location.search);
    params.set('selectedId', element.getId());
    history.replaceState(null, '', `?${params.toString()}`);
    if (onSelect) onSelect(e);
  };
  const imageProps = {
    x: width / 2 - iconRadius,
    y: height / 2 - iconRadius,
    width: iconRadius * 2,
    height: iconRadius * 2,
  };
  const imageComponent = osImage ? (
    <image {...imageProps} xlinkHref={osImage} />
  ) : (
    <VirtualMachineIcon style={imageProps} x={imageProps.x} y={imageProps.y} />
  );

  const useStyles = makeStyles({
    kubevirtbg: {
      fill: 'var(--pf-v5-global--BackgroundColor--light-100)',
    },
  });
  const classes = useStyles();
  return (
    <g>
      <BaseNode
        kind={kind}
        element={element}
        truncateLength={RESOURCE_NAME_TRUNCATE_LENGTH}
        onSelect={onNodeSelect}
        {...rest}
      >
        <rect
          className={classes.kubevirtbg}
          x={VM_STATUS_GAP + VM_STATUS_WIDTH}
          y={VM_STATUS_GAP + VM_STATUS_WIDTH}
          rx={VM_STATUS_RADIUS}
          ry={VM_STATUS_RADIUS}
          width={width - (VM_STATUS_GAP + VM_STATUS_WIDTH) * 2}
          height={height - (VM_STATUS_GAP + VM_STATUS_WIDTH) * 2}
        />
        {imageComponent}
      </BaseNode>
    </g>
  );
};

export default VmNode;
