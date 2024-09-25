import { makeStyles } from '@material-ui/core';

import { ProcessInstanceStatusDTO } from '@janus-idp/backstage-plugin-orchestrator-common';

const useStyles = makeStyles(
  theme =>
    ({
      [ProcessInstanceStatusDTO.Active]: {
        color: theme.palette.primary.main,
      },
      [ProcessInstanceStatusDTO.Completed]: {
        color: theme.palette.success.main,
      },
      [ProcessInstanceStatusDTO.Suspended]: {
        color: theme.palette.warning.main,
      },
      [ProcessInstanceStatusDTO.Aborted]: {
        color: theme.palette.error.main,
      },
      [ProcessInstanceStatusDTO.Error]: {
        color: theme.palette.error.main,
      },
      [ProcessInstanceStatusDTO.Pending]: {
        color: theme.palette.grey[500],
      },
    }) as const,
);

export const useWorkflowInstanceStateColors = (
  value?: ProcessInstanceStatusDTO,
) => {
  const styles = useStyles();
  return value ? styles[value] : undefined;
};
