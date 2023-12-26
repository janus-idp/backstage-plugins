export interface WorkflowSuggestion {
  id: string;
  name: string;
}

export type WorkflowRunDetail = {
  id: string;
  name: string;
  workflow: string;
  status: string;
  started: string;
  duration: string;
  category?: string;
  description?: string;
  nextWorkflowSuggestions?: {
    [key: string]: WorkflowSuggestion | WorkflowSuggestion[];
  };
};
