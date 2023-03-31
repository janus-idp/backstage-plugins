import type { StrictRJSFSchema, UiSchema } from '@rjsf/utils';

export type PropsFromComponent<C> = C extends (props: infer P) => JSX.Element
  ? P
  : never;

export interface Step {
  uiSchema: UiSchema;
  mergedSchema: StrictRJSFSchema;
  schema: StrictRJSFSchema;
  title: string;
  description?: string;
  parent?: Step;
}

export interface FormSchema {
  steps: Step[];
}
