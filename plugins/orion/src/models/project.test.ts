import { Project, projectSchema } from './project';

describe('project', () => {
  it('parses the project response', () => {
    const result = projectSchema.safeParse({
      id: 'c6066cdd-9984-48a3-a08e-cc000a3f4d35',
      name: 'string',
      description: 'string',
      createDate: '2023-03-09T20:43:05.061+00:00',
      modifyDate: '2023-03-09T20:43:05.061+00:00',
      username: null,
    }) as { success: true; data: Project };

    expect(result.success).toBe(true);
  });
});
