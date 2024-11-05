// import { JsonObject, JsonValue } from '@backstage/types';
// import { JSONSchema7 } from 'json-schema';
import { JsonObject, JsonValue } from '@backstage/types';

import type { JSONSchema7 } from 'json-schema';
import { JsonSchema, Draft07 as JSONSchema } from 'json-schema-library';

export function isJsonObject(value?: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function processSchema(
  key: string,
  value: JsonValue | undefined,
  schema: JSONSchema7,
  formState: JsonObject,
): JsonObject {
  const parsedSchema = new JSONSchema(schema);
  const definitionInSchema =
    key === ''
      ? (schema as JsonSchema)
      : parsedSchema.getSchema({
          pointer: `#/${key}`,
          data: formState,
        });

  const name = definitionInSchema?.title ?? key;
  if (definitionInSchema) {
    if (definitionInSchema['ui:widget'] === 'password') {
      return { [name]: '******' };
    }

    if (isJsonObject(value)) {
      // Recurse nested objects
      const nestedValue = Object.entries(value).reduce(
        (prev, [nestedKey, _nestedValue]) => {
          const curKey = key ? `${key}/${nestedKey}` : nestedKey;
          return {
            ...prev,
            ...processSchema(curKey, _nestedValue, schema, formState),
          };
        },
        {},
      );
      return { [name]: nestedValue };
    }
  }

  return { [name]: value };
}

function generateReviewTableData(
  schema: JSONSchema7,
  data: JsonObject,
): JsonObject {
  schema.title = '';
  const result = processSchema('', data, schema, data);
  return result[''] as JsonObject;
}

export default generateReviewTableData;
