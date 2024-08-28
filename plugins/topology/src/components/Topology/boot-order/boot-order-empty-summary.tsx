import * as React from 'react';

import { ExpandableSection, Text, TextVariants } from '@patternfly/react-core';

import { BootableDeviceType } from '../../../types/vm';
import { deviceKey, deviceLabel } from '../../../utils/vm-utils';

import './boot-order.css';

export const BootOrderEmptySummary: React.FC<BootOrderEmptySummaryProps> = ({
  devices,
}) => {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const options = devices.filter(device => !device.value.bootOrder);
  const onToggle = React.useCallback(
    () => setIsExpanded(!isExpanded),
    [isExpanded],
  );

  // Note(Yaacov):
  // className='text-secondary' is a hack to fix TextVariants being overriden.
  // Using <ol> because '@patternfly/react-core' <List> currently miss isOrder parameter.
  return (
    <>
      <Text
        component={TextVariants.p}
        className="kubevirt-boot-order-summary__empty-text"
      >
        No resource selected
      </Text>
      <Text component={TextVariants.small} className="text-secondary">
        VM will attempt to boot from disks by order of apearance in YAML file
      </Text>
      {options.length > 0 && (
        <ExpandableSection
          toggleText={
            isExpanded ? 'Hide default boot disks' : 'Show default boot disks'
          }
          onToggle={onToggle}
          isExpanded={isExpanded}
          className="kubevirt-boot-order-summary__expandable"
        >
          <ol className="kubevirt-boot-order-summary__ol">
            {options.map(option => (
              <li key={deviceKey(option)}>{deviceLabel(option)}</li>
            ))}
          </ol>
        </ExpandableSection>
      )}
    </>
  );
};

export type BootOrderEmptySummaryProps = {
  devices: BootableDeviceType[];
};
