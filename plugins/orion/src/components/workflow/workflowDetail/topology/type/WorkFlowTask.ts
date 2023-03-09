export type WorkFlowTask = {
  id: string;
  type: string;
  label: string;
  status: string;
  runAfterTasks: string[];
  locked: boolean;
};
