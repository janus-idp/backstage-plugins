export type SelectedMember = {
  label: string;
  etag: string;
  namespace?: string;
  type: string;
  members?: number;
  description?: string;
};

export type CreateRoleFormValues = {
  name: string;
  namespace: string;
  description?: string;
  selectedMembers: SelectedMember[];
};
