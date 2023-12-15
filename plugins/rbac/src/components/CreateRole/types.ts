export type SelectedMember = {
  label: string;
  etag: string;
  namespace?: string;
  type: string;
  members?: number;
  description?: string;
  ref: string;
};

export type RoleFormValues = {
  name: string;
  namespace: string;
  kind: string;
  description?: string;
  selectedMembers: SelectedMember[];
};
