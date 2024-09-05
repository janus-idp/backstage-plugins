import { TARGET_PORT } from '../../const';
import { K8sResourceKind, VMIKind } from '../../types/vm';
import { getCloudInitValues, getSSHServices } from '../../utils/vm-utils';

type UseSSHCommandResult = {
  command: string;
  user: string;
  port: number;
  isRoutesLoaded: boolean;
  loadingRoutesError: string;
};

// based on dynamic-plugin solution: https://github.com/kubevirt-ui/kubevirt-plugin/pull/478
const useSSHCommand = (
  vmi: VMIKind,
  services: K8sResourceKind[],
): UseSSHCommandResult => {
  const sshService = getSSHServices(vmi, services);

  const servicePort = sshService?.spec?.ports?.find(
    port => parseInt(port.targetPort, 10) === TARGET_PORT,
  )?.nodePort;

  const consoleHostname = window.location.hostname; // fallback to console hostname

  const user = getCloudInitValues(vmi, 'user');
  const command = `ssh ${user && `${user}@`}${consoleHostname} -p ${servicePort}`;

  return {
    command,
    user,
    port: servicePort,
    isRoutesLoaded: true,
    loadingRoutesError: null,
  };
};

export default useSSHCommand;
