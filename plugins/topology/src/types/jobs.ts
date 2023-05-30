import { V1Job } from '@kubernetes/client-node';
import { PodRCData } from './pods';

export type JobData = { job: V1Job; podsData: PodRCData };

export type JobsData = JobData[];
