# @janus-idp/backstage-plugin-orchestrator-form-api

### Overview

This library offers the flexibility to override a selected list of [properties](https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props) of the `react-jsonschema-form` workflow execution form component. It allows customers to provide a custom decorator for the form component in a backstage plugin. This decorator enables users to:

- **Custom Validations:** Two types of custom validations can be added on top of the JSON schema validation provided by default:
  - Synchronous validation through the `customValidate` property
  - Asynchronous validation through the `getExtraErrors` property. Handles validations that require backend calls.
- **Custom Components:** Replace default components by overriding the `widgets` property.
- **Correlated Field Values:** Implement complex inter-field dependencies by overriding the `onChange` and the `formData` properties.

The decorator will be provided through a factory method that leverages a [Backstage utility API](https://backstage.io/docs/api/utility-apis) offered by the orchestrator.

### Interface Provided in this package

```typescript
export type FormDecoratorProps = Pick<
  FormProps<JsonObject, JSONSchema7>,
  'formData' | 'formContext' | 'widgets' | 'onChange' | 'customValidate'
> & {
  getExtraErrors?: (
    formData: JsonObject,
  ) => Promise<ErrorSchema<JsonObject>> | undefined;
};

export type FormDecorator = (
  FormComponent: React.ComponentType<FormDecoratorProps>,
) => React.ComponentType;

export interface FormExtensionsApi {
  getFormDecorator(schema: JSONSchema7): FormDecorator;
}
```

### Example API Implementation

```typescript
class CustomFormExtensionsApi implements FormExtensionsApi {
  getFormDecorator(schema: JSONSchema7) {
    return (FormComponent: React.ComponentType<FormDecoratorProps>>) => {
      const widgets = {CountryWidget};
      return () => <FormComponent widgets={widgets} />;
    };
  }
}
```

### Plugin Creation Example

```typescript
export const formApiFactory = createApiFactory({
  api: orchestratorFormApiRef,
  deps: {},
  factory() {
    return new CustomApi();
  },
});

export const testFactoryPlugin = createPlugin({
  id: 'testfactory',
  apis: [formApiFactory],
});
```

### Schema example for above plugin

```typescript
{
  "title": "Product",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "title": "Name"
    },
    "country": {
      "type": "string",
      "title": "Country",
      "description": "Country of residence",
      "ui:widget": "CountryWidget"
    }
  },
  "required": ["name", "country"]
}
```

### dynamic plugin configuration

add the following to app-config.local.yaml for integrating the dynamic plugin.

```yaml
dynamicPlugins:
  frontend:
    backstage-plugin-testfactory:
      apiFactories:
        - importName: formApiFactory
```

### Additional Details

The workflow execution schema adheres to the [json-schema](https://json-schema.org/) format, which allows for extending the schema with custom properties beyond the official specification. This flexibility enables the inclusion of additional [UiSchema](https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/uiSchema/) fields directly within the schema, as demonstrated in the example above.

The orchestrator plugin handles the separation of UI schema fields from the main schema. It also organizes the form into wizard steps based on an additional hierarchical structure within the JSON schema.

Full plugin example is available [here](https://github.com/parodos-dev/extended-form-example-plugin).
