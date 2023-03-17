export type WorkFlowTask = {
  id: string;
  label: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  runAfterTasks: string[];
  locked: boolean;
};
