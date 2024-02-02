import { buildGraphQlQuery } from '../../src/helpers/queryBuilder';

describe('GraphQL query builder', () => {
  it('should return properly formatted graphQL query', () => {
    const expectedQuery: string = '';
    expect(
      buildGraphQlQuery(
        'ProcessInstances',
        'id, processName, processId, state, start, lastUpdate, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey}',
        'processId: {isNull: false}',
      ),
    ).toEqual(expectedQuery);
  });
});
