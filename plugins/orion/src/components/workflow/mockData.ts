export const mockApplications = [
  // TODO: fectch from API
  {
    id: 'app-andromeda',
    name: 'Onboard to Andromeda',
    subtitle: 'New application',
    description: 'Lorem ipsum',
  },
  {
    id: 'app-solitaire',
    name: 'Sign up for Solitaire',
    subtitle: 'Mandatory for all new employees',
    description: 'Company-wide championship',
  },
];
[1, 2, 3, 4, 5, 6].forEach(i => {
  mockApplications.push({
    id: `app-${i}`,
    name: `Application ${i}`,
    subtitle: `Subtitle ${i}`,
    description: `Description ${i}`,
  });
});
