import {
  IntrospectionField,
  TypeKind,
  TypeName,
} from '@janus-idp/backstage-plugin-orchestrator-common';

export const mockProcessDefinitionArguments = {
  __type: {
    kind: 'INPUT_OBJECT',
    name: 'ProcessDefinitionArgument',
    inputFields: [
      {
        name: 'and',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: {
              kind: 'INPUT_OBJECT',
              name: 'ProcessDefinitionArgument',
              ofType: null,
            },
          },
        },
      },
      {
        name: 'or',
        type: {
          kind: 'LIST',
          name: null,
          ofType: {
            kind: 'NON_NULL',
            name: null,
            ofType: {
              kind: 'INPUT_OBJECT',
              name: 'ProcessDefinitionArgument',
              ofType: null,
            },
          },
        },
      },
      {
        name: 'not',
        type: {
          kind: 'INPUT_OBJECT',
          name: 'ProcessDefinitionArgument',
          ofType: null,
        },
      },
      {
        name: 'id',
        type: {
          kind: 'INPUT_OBJECT',
          name: 'StringArgument',
          ofType: null,
        },
      },
      {
        name: 'name',
        type: {
          kind: 'INPUT_OBJECT',
          name: 'StringArgument',
          ofType: null,
        },
      },
      {
        name: 'version',
        type: {
          kind: 'INPUT_OBJECT',
          name: 'StringArgument',
          ofType: null,
        },
      },
    ],
  },
};

export const mockProcessDefinitionIntrospection: IntrospectionField[] = [
  {
    name: 'id',
    type: {
      kind: TypeKind.InputObject,
      name: TypeName.String,
      ofType: null,
    },
  },
  {
    name: 'name',
    type: {
      kind: TypeKind.InputObject,
      name: TypeName.String,
      ofType: null,
    },
  },
  {
    name: 'version',
    type: {
      kind: TypeKind.InputObject,
      name: TypeName.String,
      ofType: null,
    },
  },
];
