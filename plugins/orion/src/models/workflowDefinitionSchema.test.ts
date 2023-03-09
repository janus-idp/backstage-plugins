import {
  type WorkflowDefinition,
  workflowDefinitionSchema,
} from './workflowDefinitionSchema';

describe('WorkflowDefinitionSchema', () => {
  it('parses the API workflow definitions', () => {
    const result = workflowDefinitionSchema.safeParse({
      id: '033e1583-6eb9-4931-9416-dd889ae0042f',
      name: 'onboardingAssessment_ASSESSMENT_WORKFLOW',
      type: 'ASSESSMENT',
      author: null,
      createDate: '2023-03-06T14:21:35.342+00:00',
      modifyDate: '2023-03-06T14:21:35.342+00:00',
      tasks: [
        {
          id: '45f476ff-4006-4a39-be62-d3f0e93462cb',
          name: 'onboardingAssessmentTask',
          parameters: [
            {
              key: 'INPUT',
              description:
                'Enter some information to use for the Assessment to determine if they can onboard',
              optional: false,
              type: 'TEXT',
            },
          ],
          outputs: [],
        },
      ],
    }) as { success: true; data: WorkflowDefinition };

    expect(result.success).toBe(true);
  });
});
