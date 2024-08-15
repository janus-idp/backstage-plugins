# @janus-idp/backstage-plugin-orchestrator-form-api

### Overview

This library offers the flexibility to completely override all [properties](https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props) of the `react-jsonschema-form` workflow execution form component. It allows customers to provide a custom decorator for the form component, which can be defined by implementing a dynamic frontend plugin. This decorator enables users to:

- **Dynamic Validations:** Override the `extraErrors` property to implement dynamic validation logic.
- **Custom Components:** Replace default components by overriding the `widgets` property.
- **Correlated Field Values:** Implement complex inter-field dependencies by overriding the `onChange` property.
- **Additional Customizations:** Make other necessary adjustments by overriding additional properties.

The decorator will be provided through a factory method that leverages a [Backstage utility API](https://backstage.io/docs/api/utility-apis) offered by the orchestrator.

### Interface Provided in this package

```typescript
export type FormDecorator = (
  FormComponent: React.ComponentType<Partial<FormProps>>,
) => React.ComponentType;

export interface FormExtensionsApi {
  getFormDecorator(): FormDecorator;
}
```

### Example API Implementation

```typescript
class CustomFormExtensionsApi implements FormExtensionsApi {
  getFormDecorator() {
    return (FormComponent: React.ComponentType<Partial<FormProps>>) => {
      const widgets = {
        color1: ColorWidget
      };
      return () => <FormComponent widgets={widgets} />;
    };
  }
}
```

### Plugin Creation Example

```typescript
export const testFactoryPlugin = createPlugin({
  id: 'testfactory',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: formExtensionsApiRef,
      deps: {},
      factory() {
        return new CustomApi();
      },
    }),
  ],
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
      "title": "Product Name"
    },
    "color": {
      "type": "string",
      "title": "Product Color",
      "description": "The color of the product",
      "ui:widget": "color1"
    }
  },
  "required": ["name", "color"]
}
```

### Additional Details

The workflow execution schema adheres to the [json-schema](https://json-schema.org/) format, which allows for extending the schema with custom properties beyond the official specification. This flexibility enables the inclusion of additional [UiSchema](https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/uiSchema/) fields directly within the schema, as demonstrated in the example above.

The orchestrator plugin handles the separation of UI schema fields from the main schema. By default, it also organizes the form into wizard steps based on an additional hierarchical structure within the JSON schema. This behavior is built into the orchestrator plugin but can be customized or overridden using the provided decorator.
