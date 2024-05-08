export type ActorDetails = {
  actorId: string;
  ip: string;
  hostname: string;
  userAgent: string;
};

// TODO: Get proper type for body
export type AuditRequest = {
  body: unknown;
  uri: string;
  method: string;
};
export type AuditResponse = {
  body: unknown;
  status: number;
};
export type auditLog = {
  actor: ActorDetails;
  eventName: string;
  stage: string;
  request?: AuditRequest;
  response?: AuditResponse;
  meta: { [key: string]: any };
  isAuditLog: true;
} & auditStatus;

export type auditStatus =
  | {
      status: 'failed';
      errors: {
        name: string;
        message: string;
        stack: string;
      };
    }
  | { status: 'succeeded' };
