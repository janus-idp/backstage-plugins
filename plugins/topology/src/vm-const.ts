export enum VMIPhase {
  Pending = 'Pending',
  Scheduling = 'Scheduling',
  Scheduled = 'Scheduled',
  Running = 'Running',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Unknown = 'Unknown',
}
export enum VMStatusSimpleLabel {
  Starting = 'Starting',
  Paused = 'Paused',
  Migrating = 'Migrating',
  Stopping = 'Stopping',
  Running = 'Running',
  Stopped = 'Stopped',
  Deleting = 'Deleting',
}
export enum VMStatusEnum {
  PAUSED = 'Paused',
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  ERROR = 'Error',
  PENDING = 'Pending', // VMI_WAITING,CDI_IMPORT_PENDING,V2V_CONVERSION_PENDING
  IN_PROGRESS = 'Progress', // STARTING, STOPPING, DELETING
  UNKNOWN = 'Unknown',
}
export enum RunStrategy {
  Always = 'Always',
  RerunOnFailure = 'RerunOnFailure',
  Halted = 'Halted',
  Manual = 'Manual',
}
export enum StateChangeRequest {
  Start = 'Start',
  Stop = 'Stop',
}
export const POD_PHASE_PENDING = 'Pending';
