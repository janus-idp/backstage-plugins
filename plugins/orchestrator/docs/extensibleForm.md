# Extensible Workflow Execution Form

This capability enables developers to extend and customize the `react-jsonschema-form` workflow execution form component. It is designed to enable developers to implement a Backstage plugin that provides a custom decorator for the workflow execution form. This decorator supports overriding a selected set of [react-json-schema-form properties](https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props) enabling the following features:

- **Custom Validations:** Extend default JSON schema validation with:
  - **Synchronous Validation** via the `customValidate` property.
  - **Asynchronous Validation** via the `getExtraErrors` property, for validations requiring backend calls.
- **Custom Components:** Replace default form components by overriding the `widgets` property.
- **Interdependent Field Values:** Manage complex inter-field dependencies using the `onChange` and `formData` properties.

The custom decorator is delivered via a factory method that leverages a [Backstage utility API](https://backstage.io/docs/api/utility-apis) provided by the orchestrator. To trigger the desired behavior, the workflow schema should include custom UI properties.

For reference, an example plugin can be found [here](https://github.com/parodos-dev/custom-form-example-plugin/tree/1.3).

## API

To implement the API, include @janus-idp/backstage-plugin-orchestrator-form-api package as a dependency by running:

```bash
yarn add @janus-idp/backstage-plugin-orchestrator-form-api@~1.0.101
``` 
This will ensure that you install version 1.0.101 of the package that is compatible with backstage 1.29.x, allowing updates only to patch versions within the 1.0.x range.

This package provides the `FormExtensionsApi` interface and related types.

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
class CustomFormApi implements FormExtensionsApi {
  getFormDecorator(schema: JSONSchema7) {
    return (FormComponent: React.ComponentType<FormDecoratorProps>>) => {
      const widgets = {CountryWidget}; // CountryWidget needs to be implemneted and imported
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
    return new CustomFormApi();
  },
});

export const testFactoryPlugin = createPlugin({
  id: 'custom-form-plugin',
  apis: [formApiFactory],
});
```

### Schema example for above plugin

```typescript
{
  "type": "object",
  "properties": {
    "personalDetails": {
      "type": "object",
      "title": "Personal Details",
      "properties": {
        "name": {
          "type": "string",
          "title": "Name"
        },
        "country": {
          "type": "string",
          "title": "Country",
          "ui:widget": "CountryWidget"
        }
      }
    },
    "contactDetails": {
      "type": "object",
      "title": "Contact Details",
      "properties": {
        "email": {
          "type": "string",
          "title": "Email"
        },
        "phone": {
          "type": "string",
          "title": "Phone Number"
        }
      }
    }
  }
}
```

### Dynamic plugin configuration example

Add the following to backstage config to integrate the plugin:

```yaml
dynamicPlugins:
  frontend:
    custom-form-plugin:
      apiFactories:
        - importName: formApiFactory
```

### Referencing the custom behavior in the schema

The workflow execution schema adheres to the [json-schema](https://json-schema.org/) format, which allows for extending the schema with custom properties beyond the official specification. This flexibility enables the inclusion of additional [uiSchema](https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/uiSchema/) fields directly within the schema, as demonstrated in the example above.

### How It All Comes Together

The `orchestrator-form-react` plugin implements the form component for workflow execution. It integrates with the custom API provided by the developer's plugin to generate and customize the form. The `orchestrator` plugin then incorporates this form into the workflow execution page.

The `orchestrator-form-react` plugin handles the following key tasks:

- **Generating the UI Schema:** It extracts custom UI schema fields from the main schema, automatically generates the [uiSchema](https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/uiSchema/), and passes it to the `react-jsonschema-form` component, enabling advanced UI customizations.

- **Organizing Forms into Wizard-Style Steps:** If the schema is an object containing nested objects (i.e., the root is an object, and its properties are also objects), the plugin organizes the form into multiple steps. Each nested object becomes a separate step in a wizard-style interface. For example, the schema provided above results in two steps: _Personal Details_ and _Contact Details_.

The [`orchestrator-form-react`](https://github.com/janus-idp/backstage-plugins/tree/main/plugins/orchestrator-form-react) plugin is designed to operate independently of the main orchestrator plugin. This modularity allows developers to test and validate form behavior in a standalone Backstage development environment before integrating it with the full orchestrator setup.

To use orchestrator-form-react, add the `@janus-idp/backstage-plugin-orchestrator-form-react` package as a dependency in your project by running:

```bash
yarn add @janus-idp/backstage-plugin-orchestrator-form-react@~1.0.101
``` 
This will ensure that you install version 1.0.101 of the package that is compatible with backstage 1.29.x, allowing updates only to patch versions within the 1.0.x range.