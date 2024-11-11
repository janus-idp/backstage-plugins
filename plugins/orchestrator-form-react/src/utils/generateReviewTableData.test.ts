import type { JSONSchema7 } from 'json-schema';

import generateReviewTableData from './generateReviewTableData';

describe('mapSchemaToData', () => {
  it('should map schema titles to data values correctly', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      title: 'Person',
      properties: {
        firstName: {
          type: 'string',
          title: 'First Name',
        },
        lastName: {
          type: 'string',
          title: 'Last Name',
        },
        age: {
          type: 'number',
          title: 'Age',
        },
        address: {
          type: 'object',
          title: 'Address',
          properties: {
            street: {
              type: 'string',
              title: 'Street',
            },
            city: {
              type: 'string',
              title: 'City',
            },
          },
        },
      },
    };

    const data = {
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      address: {
        street: '123 Main St',
        city: 'Somewhere',
      },
    };

    const expectedResult = {
      'First Name': 'John',
      'Last Name': 'Doe',
      Age: 30,
      Address: {
        Street: '123 Main St',
        City: 'Somewhere',
      },
    };

    const result = generateReviewTableData(schema, data);
    expect(result).toEqual(expectedResult);
  });

  it('should map schema titles to data values with arrays correctly', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      title: 'Person',
      properties: {
        firstName: {
          type: 'string',
          title: 'First Name',
        },
        hobbies: {
          type: 'array',
          title: 'Hobbies',
          items: {
            type: 'string',
          },
        },
      },
    };

    const data = {
      firstName: 'Jane',
      hobbies: ['reading', 'hiking'],
    };

    const expectedResult = {
      'First Name': 'Jane',
      Hobbies: ['reading', 'hiking'],
    };

    const result = generateReviewTableData(schema, data);
    expect(result).toEqual(expectedResult);
  });

  it('should map schema titles to data values with complex nesting correctly', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        person: {
          type: 'object',
          title: 'Person',
          properties: {
            name: {
              type: 'string',
              title: 'Name',
            },
            addresses: {
              type: 'array',
              title: 'Addresses',
              items: {
                type: 'object',
                properties: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                },
              },
            },
          },
        },
      },
    };

    const data = {
      person: {
        name: 'John',
        addresses: [
          { street: '123 A St', city: 'City A' },
          { street: '456 B St', city: 'City B' },
        ],
      },
    };

    const expectedResult = {
      Person: {
        Name: 'John',
        Addresses: [
          {
            street: '123 A St',
            city: 'City A',
          },
          {
            street: '456 B St',
            city: 'City B',
          },
        ],
      },
    };

    const result = generateReviewTableData(schema, data);
    expect(result).toEqual(expectedResult);
  });
});
