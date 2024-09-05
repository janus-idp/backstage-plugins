import React from 'react';

import { ClipboardCopy } from '@patternfly/react-core';

import { ResourceIcon } from '../../../common/components/ResourceName';
import { LABEL_USED_TEMPLATE_NAME, TARGET_PORT } from '../../../const';
import { K8sResourcesContext } from '../../../hooks/K8sResourcesContext';
import { useGuestAgentInfo } from '../../../hooks/virtual-machine/use-guest-agent-info';
import useSSHCommand from '../../../hooks/virtual-machine/use-ssh-command';
import { VMKind } from '../../../types/vm';
import {
  findPodFromVMI,
  findVMI,
  getDescription,
  getGPUDevices,
  getHostDevices,
  getLabel,
  getLabeledDevices,
  getNodeName,
  getOperatingSystem,
  getOperatingSystemName,
  getSSHServices,
  getVmiIpAddresses,
  getVMINodeName,
  getWorkloadProfile,
  isV1Pod,
  isVMIKind,
  isVMIReady,
} from '../../../utils/vm-utils';
import { BootOrderSummary } from '../boot-order/boot-order-summary';
import TopologySideBarDetailsItem from './TopologySideBarDetailsItem';
import TopologyWorkloadDetails from './TopologyWorkloadDetails';

type TopologyVirtualMachineDetailsProps = {
  vm: VMKind;
};

const TopologyVirtualMachineDetails = ({
  vm,
}: TopologyVirtualMachineDetailsProps) => {
  const resources = React.useContext(K8sResourcesContext);
  const allPods = resources?.watchResourcesData?.pods?.data?.filter(isV1Pod);
  const allVMIs =
    resources?.watchResourcesData?.virtualmachineinstances?.data?.filter(
      isVMIKind,
    );
  const vmi = findVMI(vm, allVMIs);
  const pods = findPodFromVMI(vmi, allPods);
  const devices = getLabeledDevices(vm) || [];
  const ipAddrs = getVmiIpAddresses(vmi); // Need data to test
  const description = getDescription(vm);
  const templateName = getLabel(vm, LABEL_USED_TEMPLATE_NAME);
  const nodeName = getVMINodeName(vmi) || getNodeName(pods);
  const os = getOperatingSystemName(vm) || getOperatingSystem(vm);
  const workloadProfile = getWorkloadProfile(vm);

  // if vmi.status.type===AgentConnected then
  const [guestAgentInfoRaw] = useGuestAgentInfo({ vmi });
  const hostname = guestAgentInfoRaw?.hostname;
  const timeZone = guestAgentInfoRaw?.timezone;
  const allServices = resources?.watchResourcesData?.services?.data;
  const vmiReady = isVMIReady(vmi);
  const sshService = getSSHServices(vmi, allServices);
  const sshServicesRunning = !!sshService;
  const sshServicePort = sshService?.spec?.ports?.find(
    port => parseInt(port.targetPort, 10) === TARGET_PORT,
  )?.nodePort;
  const { command, user } = useSSHCommand(vmi, allServices);

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
        data-testid="virtualmachine-details"
      >
        <TopologySideBarDetailsItem
          label="Description"
          emptyText="Not available"
        >
          {description}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem
          label="Operating System"
          emptyText="Not available"
        >
          {os}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Template">
          <ResourceIcon kind="Template" />
          {templateName}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Pod">
          {pods?.map(pod => (
            <label key={pod?.metadata?.uid}>{pod?.metadata?.name}</label>
          ))}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Boot order">
          <BootOrderSummary devices={devices} />
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="IP address">
          {ipAddrs}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem
          label="Hostname"
          emptyText="Virtual machine not running"
        >
          {hostname}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem
          label="Time zone"
          emptyText="Virtual machine not running"
        >
          {timeZone}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Node" emptyText="Not available">
          {nodeName}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem
          label="Workload profile"
          emptyText="Not available"
        >
          {workloadProfile}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="User credentials">
          {vmiReady ? (
            <>
              <span data-test="details-item-user-credentials-user-name">
                {`user' ${user}`}
              </span>
              <ClipboardCopy
                isReadOnly
                data-test="SSHDetailsPage-command"
                className="SSHDetailsPage-clipboard-command"
              >
                {sshServicesRunning ? command : `ssh ${user}@`}
              </ClipboardCopy>
              {!sshServicesRunning && (
                <span className="kubevirt-menu-actions__secondary-title">
                  Requires SSH service
                </span>
              )}
            </>
          ) : (
            <div className="text-secondary">Virtual machine not running</div>
          )}
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="SSH access">
          <span data-test="details-item-ssh-access-port">
            {vmiReady
              ? sshServicesRunning
                ? `Port: ${sshServicePort}`
                : 'SSH service disabled'
              : 'Virtual machine not running'}
          </span>
        </TopologySideBarDetailsItem>
        <TopologySideBarDetailsItem label="Hardware devices">
          <div>GPU devices: {getGPUDevices(vm).length}</div>
          <div>Host devices: {getHostDevices(vm).length}</div>
        </TopologySideBarDetailsItem>
      </div>
    </>
  );
};

export default TopologyVirtualMachineDetails;
