export type JobTemplate = {
  id: number;
  url: string;
  name: string;
  description: string;
  type: string;
  [key: string]: any;
};

export type JobTemplates = any[];
