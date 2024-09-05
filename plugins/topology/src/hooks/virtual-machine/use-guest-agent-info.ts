import { VMIKind } from '../../types/vm';
import { V1VirtualMachineInstanceGuestAgentInfo } from '../../types/vmi-guest-agent-info';
import { isGuestAgentInstalled } from '../../utils/guest-agent-utils';
import { getVMIApiPath, getVMISubresourcePath } from '../../utils/selector';
import { useURLPoll } from './url-poll-hook';

export const GUEST_AGENT_POLL_DEFAULT_DELAY = 3000; // 3 seconds

const getGuestAgentURL = (vmi: VMIKind) =>
  vmi &&
  isGuestAgentInstalled(vmi) &&
  `/${getVMISubresourcePath()}/${getVMIApiPath(vmi)}/guestosinfo`;

const useGuestAgentInfo = ({
  vmi,
  delay = GUEST_AGENT_POLL_DEFAULT_DELAY,
}: GuestAgentInfoProps) =>
  useURLPoll<V1VirtualMachineInstanceGuestAgentInfo>(
    getGuestAgentURL(vmi) as string,
    delay,
  );

export type GuestAgentInfoProps = {
  vmi: VMIKind;
  delay?: number;
};

export { useGuestAgentInfo };
