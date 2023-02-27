export const mockApplications = [
  // TODO: fectch from API: https://issues.redhat.com/browse/FLPATH-102
  {
    id: 'app-andromeda',
    // TODO: mind using just "Andromeda" instead of "Onboard to Andromeda"
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
