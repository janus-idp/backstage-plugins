import { StrictRJSFSchema, UiSchema } from '@rjsf/utils';

export const schema: StrictRJSFSchema = {
  title: '',
  type: 'object',
  required: ['userName', 'password'],
  properties: {
    userName: {
      type: 'string',
      // TODO: Make this configurable
      title: 'SOEID',
      minLength: 1,
    },
    password: {
      type: 'string',
      title: 'Password',
      minLength: 1,
    },
  },
};

export const uiSchema: UiSchema = {
  password: {
    'ui:widget': 'password',
    'ui:title': 'Password',
  },
};
