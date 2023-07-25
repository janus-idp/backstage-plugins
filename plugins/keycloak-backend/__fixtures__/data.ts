export const groups = [
  {
    id: '9cf51b5d-e066-4ed8-940c-dc6da77f81a5',
    name: 'biggroup',
    path: '/biggroup',
    subGroups: [
      {
        id: 'eefa5b46-0509-41d8-b8b3-7ddae9c83632',
        name: 'subgroup',
        path: '/biggroup/subgroup',
        subGroups: [],
      },
    ],
  },
  {
    id: '557501bd-8188-41c0-a2d5-43ff3d5b0258',
    name: 'emptygroup',
    path: '/emptygroup',
    subGroups: [],
  },
  {
    id: 'bb10231b-2939-4b1a-b8bb-9249ed7b76f7',
    name: 'testgroup',
    path: '/testgroup',
    subGroups: [],
  },
];

export const users = [
  {
    id: '59efec15-a00b-4700-8833-5f4cdecc1132',
    createdTimestamp: 1686170983010,
    username: 'jamesdoe',
    enabled: true,
    totp: false,
    emailVerified: false,
    firstName: '',
    lastName: '',
    email: 'jamesdoe@gmail.com',
    disableableCredentialTypes: [],
    requiredActions: [],
    notBefore: 0,
    access: {
      manageGroupMembership: false,
      view: true,
      mapRoles: false,
      impersonate: false,
      manage: false,
    },
  },
  {
    id: 'c982b51a-abf6-4f68-bfdf-a1c6257214fc',
    createdTimestamp: 1686170953553,
    username: 'joedoe',
    enabled: true,
    totp: false,
    emailVerified: false,
    firstName: '',
    lastName: '',
    disableableCredentialTypes: [],
    requiredActions: [],
    notBefore: 0,
    access: {
      manageGroupMembership: false,
      view: true,
      mapRoles: false,
      impersonate: false,
      manage: false,
    },
  },
  {
    id: '2bf97dbd-fd6a-47ae-986b-2632fa95e03f',
    createdTimestamp: 1686170890908,
    username: 'johndoe',
    enabled: true,
    totp: false,
    emailVerified: false,
    firstName: 'John',
    lastName: 'Doe',
    disableableCredentialTypes: [],
    requiredActions: [],
    notBefore: 0,
    access: {
      manageGroupMembership: false,
      view: true,
      mapRoles: false,
      impersonate: false,
      manage: false,
    },
  },
];

export const groupMembers = [
  ['jamesdoe'],
  [],
  [],
  ['jamesdoe', 'joedoe', 'johndoe'],
];
