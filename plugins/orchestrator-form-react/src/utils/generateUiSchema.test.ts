import { UiSchema } from '@rjsf/utils';
import type { JSONSchema7 } from 'json-schema';

import generateUiSchema from './generateUiSchema';

describe('extract ui schema', () => {
  it('if has properties ui: should create ui schema with properties', () => {
    const expected = {
      name: { 'ui:validationType': 'product', 'ui:autofocus': true },
      color: { 'ui:widget': 'color1', 'ui:validationType': 'color' },
    };
    const mixedSchema: JSONSchema7 = {
      title: 'Product',
      type: 'object',
      properties: {
        name: {
          type: 'string',
          title: 'Product Name',
          'ui:validationType': 'product',
        },
        color: {
          type: 'string',
          title: 'Product Color',
          description: 'The color of the product',
          'ui:widget': 'color1',
          'ui:validationType': 'color',
        },
      },
      required: ['name', 'color'],
    } as JSONSchema7;
    const uiSchema = generateUiSchema(mixedSchema, false);
    expect(uiSchema).toEqual(expected);
  });

  it('if no properties ui: should create ui schema just with auto focus', () => {
    const mixedSchema: JSONSchema7 = {
      title: 'Product',
      type: 'object',
      properties: {
        name: {
          type: 'string',
          title: 'Product Name',
        },
        color: {
          type: 'string',
          title: 'Product Color',
          description: 'The color of the product',
        },
      },
      required: ['name', 'color'],
    } as JSONSchema7;
    const uiSchema = generateUiSchema(mixedSchema, false);
    expect(uiSchema).toEqual({ name: { 'ui:autofocus': true } });
  });

  it('should extract from array', () => {
    const mixedSchema = {
      title: 'A list of tasks',
      type: 'object',
      required: ['title'],
      properties: {
        title: {
          type: 'string',
          title: 'Task list title',
        },
        tasks: {
          type: 'array',
          title: 'Tasks',
          items: {
            type: 'object',
            required: ['title'],
            properties: {
              title: {
                type: 'string',
                title: 'Title',
                description: 'A sample title',
              },
              details: {
                type: 'string',
                title: 'Task details',
                description: 'Enter the task details',
                'ui:widget': 'textarea',
              },
              done: {
                type: 'boolean',
                title: 'Done?',
                default: false,
              },
            },
          },
        },
      },
    } as JSONSchema7;
    const expected = {
      title: {
        'ui:autofocus': true,
      },
      tasks: {
        items: {
          details: {
            'ui:widget': 'textarea',
          },
        },
      },
    } as UiSchema;
    const uiSchema = generateUiSchema(mixedSchema, false);
    expect(uiSchema).toEqual(expected);
  });

  it('should extract from array with fixed number of items', () => {
    const mixedSchema = {
      type: 'object',
      properties: {
        fixedItemsList: {
          type: 'array',
          title: 'A list of fixed items',
          items: [
            {
              title: 'A string value',
              type: 'string',
              default: 'lorem ipsum',
              'ui:widget': 'textarea',
            },
            {
              title: 'a boolean value',
              type: 'boolean',
            },
          ],
          additionalItems: {
            title: 'Additional item',
            type: 'number',
          },
        },
      },
    } as JSONSchema7;
    const expected = {
      fixedItemsList: {
        items: [
          {
            'ui:widget': 'textarea',
          },
        ],
        'ui:autofocus': true,
      },
    } as JSONSchema7;

    const uiSchema = generateUiSchema(mixedSchema, false);
    expect(uiSchema).toEqual(expected);
  });

  it('should handle anyOf', () => {
    const schemaWithAnyOf = {
      title: 'A selection of items',
      type: 'object',
      properties: {
        selectedItem: {
          anyOf: [
            { type: 'number', title: 'Number item' },
            { type: 'boolean', title: 'Boolean item' },
            { type: 'string', title: 'Color', 'ui:widget': 'color' },
          ],
        },
      },
    } as JSONSchema7;

    const expected = {
      selectedItem: {
        anyOf: [{}, {}, { 'ui:widget': 'color' }],
        'ui:autofocus': true,
      },
    };

    const uiSchema = generateUiSchema(schemaWithAnyOf, false);
    expect(uiSchema).toEqual(expected);
  });

  it('should handle oneOf', () => {
    const schemaWithAnyOf = {
      title: 'A selection of items',
      type: 'object',
      properties: {
        selectedItem: {
          oneOf: [
            { type: 'string', title: 'Color', 'ui:widget': 'color' },
            { type: 'number', title: 'Number item' },
            { type: 'boolean', title: 'Boolean item' },
          ],
        },
      },
    } as JSONSchema7;

    const expected = {
      selectedItem: {
        oneOf: [{ 'ui:widget': 'color' }],
        'ui:autofocus': true,
      },
    };

    const uiSchema = generateUiSchema(schemaWithAnyOf, false);
    expect(uiSchema).toEqual(expected);
  });

  it('should handle allOf', () => {
    const schemaWithAnyOf = {
      title: 'A selection of items',
      type: 'object',
      properties: {
        selectedItem: {
          allOf: [
            { type: 'string', title: 'Color', 'ui:widget': 'color' },
            { type: 'number', title: 'Number item' },
            { type: 'boolean', title: 'Boolean item' },
          ],
        },
      },
    } as JSONSchema7;

    const expected = {
      selectedItem: {
        allOf: [{ 'ui:widget': 'color' }],
        'ui:autofocus': true,
      },
    };

    const uiSchema = generateUiSchema(schemaWithAnyOf, false);
    expect(uiSchema).toEqual(expected);
  });

  it('should handle referenced schemas', () => {
    const refSchema = {
      title: 'A referenced schema',
      type: 'object',
      properties: {
        user: {
          $ref: '#/definitions/User',
        },
      },
      definitions: {
        User: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              title: 'First name',
              'ui:widget': 'textarea',
              'ui:autofocus': true,
            },
            lastName: { type: 'string', title: 'Last name' },
          },
        },
      },
    } as JSONSchema7;

    const expected = {
      user: {
        firstName: { 'ui:autofocus': true, 'ui:widget': 'textarea' },
      },
    };

    const uiSchema = generateUiSchema(refSchema, true);
    expect(uiSchema).toEqual(expected);
  });

  it('should handle schemas with multiple hierarchies', () => {
    const complexSchema = {
      title: 'Complex schema with multiple hierarchies',
      type: 'object',
      properties: {
        person: {
          type: 'object',
          properties: {
            name: { type: 'string', title: 'Name' },
            password: {
              type: 'string',
              title: 'Name',
              'ui:widget': 'password',
            },
            address: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  title: 'Street',
                  'ui:widget': 'textarea',
                },
                city: {
                  type: 'string',
                  title: 'City',
                  'ui:widget': 'textarea',
                },
              },
            },
          },
        },
      },
    } as JSONSchema7;

    const expected = {
      person: {
        name: { 'ui:autofocus': true },
        password: { 'ui:widget': 'password' },
        address: {
          street: { 'ui:widget': 'textarea' },
          city: { 'ui:widget': 'textarea' },
        },
      },
    };

    const uiSchema = generateUiSchema(complexSchema, true);
    expect(uiSchema).toEqual(expected);
  });

  it('should handle if/then/else schema with ui:widget: "textarea"', () => {
    const schemaWithIfThenElse = {
      title: 'Conditional Schema',
      type: 'object',
      properties: {
        age: { type: 'number', title: 'Age', 'ui:autofocus': true },
      },
      if: {
        properties: { age: { minimum: 18 } },
      },
      then: {
        properties: {
          canVote: {
            type: 'boolean',
            title: 'Can vote?',
            'ui:description': 'can vote',
          },
        },
      },
      else: {
        properties: {
          needsConsent: {
            type: 'boolean',
            title: 'Needs parental consent?',
            'ui:description': 'needs consent',
          },
        },
      },
    } as JSONSchema7;

    const expected = {
      age: { 'ui:autofocus': true },
      canVote: { 'ui:description': 'can vote' },
      needsConsent: { 'ui:description': 'needs consent' },
    };

    const uiSchema = generateUiSchema(schemaWithIfThenElse, false);
    expect(uiSchema).toEqual(expected);
  });

  it('should handle a complex schema with various ui: properties and $ref, including readonly data', () => {
    const complexSchema = {
      title: 'Complex Schema Example',
      type: 'object',
      properties: {
        userInfo: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              title: 'Name',
              'ui:autofocus': true,
              'ui:widget': 'text',
              'ui:placeholder': 'Enter your name',
              'ui:description': 'Full legal name',
            },
            age: {
              type: 'number',
              title: 'Age',
              'ui:widget': 'updown',
              'ui:help': 'Enter your age in years',
            },
            address: {
              $ref: '#/definitions/Address',
            },
          },
        },
        tasks: {
          type: 'array',
          title: 'Tasks',
          items: {
            type: 'object',
            required: ['title'],
            properties: {
              title: {
                type: 'string',
                title: 'Title',
                'ui:widget': 'color',
                'ui:description': 'Color-coded task title',
              },
              details: {
                type: 'string',
                title: 'Task details',
                'ui:widget': 'textarea',
                'ui:placeholder': 'Describe the task in detail',
              },
              done: {
                type: 'boolean',
                title: 'Done?',
                'ui:widget': 'checkbox',
              },
            },
          },
        },
        preferences: {
          type: 'object',
          properties: {
            notifications: {
              anyOf: [
                {
                  type: 'boolean',
                  title: 'Receive Notifications',
                  'ui:widget': 'radio',
                  'ui:options': { inline: true },
                },
                {
                  type: 'string',
                  title: 'Notification Email',
                  'ui:widget': 'email',
                  'ui:placeholder': 'you@example.com',
                },
              ],
            },
          },
        },
      },
      definitions: {
        Address: {
          type: 'object',
          properties: {
            street: {
              type: 'string',
              title: 'Street',
              'ui:widget': 'textarea',
              'ui:placeholder': '123 Main St',
            },
            city: {
              type: 'string',
              title: 'City',
              'ui:widget': 'select',
              'ui:emptyValue': 'Select a city',
            },
          },
        },
      },
    } as unknown as JSONSchema7;

    const expected = {
      userInfo: {
        name: {
          'ui:autofocus': true,
          'ui:widget': 'text',
          'ui:placeholder': 'Enter your name',
          'ui:description': 'Full legal name',
        },
        age: {
          'ui:widget': 'updown',
          'ui:help': 'Enter your age in years',
        },
        address: {
          street: {
            'ui:widget': 'textarea',
            'ui:placeholder': '123 Main St',
          },
          city: {
            'ui:widget': 'select',
            'ui:emptyValue': 'Select a city',
          },
        },
      },
      tasks: {
        items: {
          title: {
            'ui:widget': 'color',
            'ui:description': 'Color-coded task title',
          },
          details: {
            'ui:widget': 'textarea',
            'ui:placeholder': 'Describe the task in detail',
          },
          done: {
            'ui:widget': 'checkbox',
          },
          'ui:readonly': true,
        },
      },
      preferences: {
        notifications: {
          anyOf: [
            {
              'ui:widget': 'radio',
              'ui:options': { inline: true },
            },
            {
              'ui:widget': 'email',
              'ui:placeholder': 'you@example.com',
            },
          ],
        },
      },
    };

    const uiSchema = generateUiSchema(complexSchema, true, {
      tasks: {
        items: {
          title: 'purple',
          details: 'abc',
          done: true,
        },
      },
    });
    expect(uiSchema).toEqual(expected);
  });
});
