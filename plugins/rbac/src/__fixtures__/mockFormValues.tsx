export const mockFormCurrentValues = {
  kind: 'user',
  name: 'div',
  namespace: 'default',
  selectedMembers: [],
  permissionPoliciesRows: [
    {
      permission: 'catalog-entity',
      policies: [{ policy: 'read', effect: 'allow' }],
      policyString: 'Read',
      isResourced: true,
      plugin: 'catalog',
      conditions: {
        condition: {
          rule: 'HAS_LABEL',
          params: {
            label: 'temp',
          },
          resourceType: 'catalog-entity',
        },
      },
    },
  ],
};

export const mockFormInitialValues = {
  kind: 'user',
  name: 'div',
  namespace: 'default',
  selectedMembers: [],
  permissionPoliciesRows: [
    {
      id: 1,
      permission: 'catalog-entity',
      policies: [{ policy: 'read', effect: 'allow' }],
      policyString: 'Read',
      isResourced: true,
      plugin: 'catalog',
      conditions: {
        condition: {
          rule: 'HAS_LABEL',
          params: {
            label: 'temp',
          },
          resourceType: 'catalog-entity',
        },
      },
    },
  ],
};
