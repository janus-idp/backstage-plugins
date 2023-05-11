import { Config } from '@backstage/config';

const OPENSHIFT_TERMINAL_DEFAULT_NAMESPACE = 'openshift-terminal';

export const getDefaultNamespace = (config: Config) =>
  config.getOptionalString('webTerminal.defaultNamespace') ??
  OPENSHIFT_TERMINAL_DEFAULT_NAMESPACE;
