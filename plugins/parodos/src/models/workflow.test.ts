import { workflowSchema } from './workflow';

describe('workflow', () => {
  it('parses the workflow response', () => {
    const result = workflowSchema.safeParse({
      workFlowExecutionId: '5fecffb5-6425-478d-97c9-0f91e3b8da83',
      workFlowOptions: {
        currentVersion: null,
        upgradeOptions: [],
        migrationOptions: [],
        newOptions: [
          {
            identifier: 'onboardingOption',
            displayName: 'Onboarding',
            description: 'An example of a complex WorkFlow',
            details: ['An example of a complex WorkFlow with Status checks'],
            workFlowName: 'onboardingWorkFlow_INFRASTRUCTURE_WORKFLOW',
          },
        ],
        continuationOptions: [],
        otherOptions: [],
        optionsAvailable: false,
      },
    });

    expect(result.success).toBe(true);
  });
});
