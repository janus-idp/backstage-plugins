export type ProjectStatusType = 'all-projects' | 'in-progress' | 'on-boarded';
export type AssessmentStatusType = 'none' | 'inprogress' | 'complete';

export type ProjectType = {
  id: string;
  name: string;
  username: string;
  description: string;
  createDate: string;
  modifyDate: string;

  /* TODO: https://issues.redhat.com/browse/FLPATH-131 */
  status?: ProjectStatusType;
};

export type ApplicationType = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
};
