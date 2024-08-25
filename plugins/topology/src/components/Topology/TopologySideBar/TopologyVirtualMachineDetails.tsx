import React from 'react';

import { ResourceIcon } from '../../../common/components/ResourceName';
import { LABEL_USED_TEMPLATE_NAME } from '../../../const';
import { K8sResourcesContext } from '../../../hooks/K8sResourcesContext';
import { K8sWorkloadResource } from '../../../types/types';
import {
  findPodFromVMI,
  findVMI,
  getDescription,
  getGPUDevices,
  getHostDevices,
  getLabel,
  getLabeledDevices,
  getNodeName,
  getVmiIpAddresses,
  getVMINodeName,
  // isVMIReady,
} from '../../../utils/vm-utils';
import { BootOrderSummary } from '../boot-order/boot-order-summary';
import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';
import TopologyWorkloadDetails from './TopologyWorkloadDetails';

type TopologyVirtualMachineDetailsProps = {
  vm: K8sWorkloadResource; // Need to chnage
};

const TopologyVirtualMachineDetails = ({
  vm,
}: TopologyVirtualMachineDetailsProps) => {
  const resources = React.useContext(K8sResourcesContext);
  const allPods = resources?.watchResourcesData?.pods?.data;
  const allVMIs = resources?.watchResourcesData?.virtualmachineinstances?.data;
  const vmi = findVMI(vm, allVMIs);
  const pods = findPodFromVMI(vmi, allPods);
  const devices = getLabeledDevices(vm) || [];
  const ipAddrs = getVmiIpAddresses(vmi); // Need data to test
  const description = getDescription(vm);
  const templateName = getLabel(vm, LABEL_USED_TEMPLATE_NAME);
  const nodeName = getVMINodeName(vmi) || getNodeName(pods);
  // const vmiReady = isVMIReady(vmi);
  // const [sshService] = useSSHService2(vmi);

  return (
    <>
      <div className="topology-workload-details">
        <TopologyWorkloadDetails resource={vm}>
          <TopologySideBarDetailsItem label="Status">
            {vm?.status?.printableStatus}
          </TopologySideBarDetailsItem>
        </TopologyWorkloadDetails>
      </div>
      <div
        className="topology-workload-details"
        data-testid="deployment-details"
      >
        <TopologySideBarDetailsItem
          label="Description"
          emptyText="Not available"
        >
          {description}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Operating System">
          Need to add it
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Template">
          <ResourceIcon kind="Template" />
          {templateName}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Pod">
          {pods?.map(pod => <label>{pod?.metadata?.name}</label>)}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Boot order">
          <BootOrderSummary devices={devices} />
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="IP address">
          {ipAddrs}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Hostname">
          {vm.spec?.strategy?.type}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Time zone">
          {vm.spec?.strategy?.type}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Node" emptyText="Not available">
          {nodeName}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Workload profile">
          {vm.spec?.strategy?.type}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="User credentials">
          {vm.spec?.strategy?.type}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="SSH access">
          {/* <span data-test="details-item-ssh-access-port">
          {vmiReady ? 
            sshServicesRunning ?  `Port: ${sshServicePort}` 
             : 'SSH service disabled'
            
          : 
            'Virtual machine not running')
          }
        </span> */}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Hardware devices">
          <div>GPU devices : {getGPUDevices(vm).length}</div>
          <div>Host devices : {getHostDevices(vm).length}</div>
        </TopologySideBarDetailsItem>
      </div>
    </>
  );
};

export default TopologyVirtualMachineDetails;
