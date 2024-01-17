import { makeStyles } from '@material-ui/core';

import {
  ProcessInstanceState,
  ProcessInstanceStateValues,
} from '@janus-idp/backstage-plugin-orchestrator-common';

export const useWorkflowInstanceStateColors = (
  value: ProcessInstanceStateValues,
) => {
  const useStyles = makeStyles(
    theme =>
      ({
        [ProcessInstanceState.Active]: {
          color: theme.palette.primary.main,
        },
        [ProcessInstanceState.Completed]: {
          color: theme.palette.success.main,
        },
        [ProcessInstanceState.Suspended]: {
          color: theme.palette.warning.main,
        },
        [ProcessInstanceState.Aborted]: {
          color: theme.palette.error.main,
        },
        [ProcessInstanceState.Error]: {
          color: theme.palette.error.main,
        },
      }) as const,
  );

  const styles = useStyles();
  return styles[value];
};
