import React, { Fragment } from 'react';

import { JsonObject } from '@backstage/types';

import { UiSchema } from '@rjsf/utils';
import type { JSONSchema7 } from 'json-schema';

import generateUiSchema from '../utils/generateUiSchema';
import { StepperContextProvider } from '../utils/StepperContext';
import OrchestratorFormStepper, {
  OrchestratorFormStep,
  OrchestratorFormToolbar,
} from './OrchestratorFormStepper';
import OrchestratorFormWrapper from './OrchestratorFormWrapper';
import ReviewStep from './ReviewStep';

const getNumSteps = (schema: JSONSchema7): number | undefined => {
  if (schema.type !== 'object' || !schema.properties) return undefined;
  const isMultiStep = Object.values(schema.properties).every(
    prop => (prop as JSONSchema7).type === 'object',
  );
  return isMultiStep ? Object.keys(schema.properties).length : undefined;
};

const SingleStepForm = ({
  schema,
  formData,
  onChange,
  uiSchema,
}: {
  schema: JSONSchema7;
  formData: JsonObject;
  onChange: (formData: JsonObject) => void;
  uiSchema: UiSchema<JsonObject>;
}) => {
  const steps = React.useMemo<OrchestratorFormStep[]>(() => {
    return [
      {
        title: schema.title || 'Inputs',
        key: 'schema',
        content: (
          <OrchestratorFormWrapper
            schema={{ ...schema, title: '' }}
            formData={formData}
            onChange={onChange}
            uiSchema={uiSchema}
          >
            <OrchestratorFormToolbar />
          </OrchestratorFormWrapper>
        ),
      },
    ];
  }, [schema, formData, onChange, uiSchema]);
  return <OrchestratorFormStepper steps={steps} />;
};

type OrchestratorFormProps = {
  schema: JSONSchema7;
  isExecuting: boolean;
  handleExecute: (parameters: JsonObject) => Promise<void>;
  data?: JsonObject;
  isDataReadonly?: boolean;
};

const OrchestratorForm = ({
  schema,
  handleExecute,
  isExecuting,
  data,
  isDataReadonly,
}: OrchestratorFormProps) => {
  const [formData, setFormData] = React.useState<JsonObject>(data || {});
  const numStepsInMultiStepSchema = React.useMemo(
    () => getNumSteps(schema),
    [schema],
  );
  const isMultiStep = numStepsInMultiStepSchema !== undefined;

  const _handleExecute = React.useCallback(() => {
    handleExecute(formData || {});
  }, [formData, handleExecute]);

  const onChange = React.useCallback(
    (_formData: JsonObject) => {
      setFormData(_formData);
    },
    [setFormData],
  );

  const uiSchema = React.useMemo<UiSchema<JsonObject>>(() => {
    return generateUiSchema(
      schema,
      isMultiStep,
      isDataReadonly ? data : undefined,
    );
  }, [schema, isMultiStep, isDataReadonly, data]);

  const reviewStep = React.useMemo(
    () => (
      <ReviewStep
        data={formData || {}}
        schema={schema}
        busy={isExecuting}
        handleExecute={_handleExecute}
      />
    ),
    [formData, schema, isExecuting, _handleExecute],
  );

  return (
    <StepperContextProvider reviewStep={reviewStep}>
      {isMultiStep ? (
        <OrchestratorFormWrapper
          schema={schema}
          numStepsInMultiStepSchema={numStepsInMultiStepSchema}
          formData={formData}
          onChange={onChange}
          uiSchema={uiSchema}
        >
          <Fragment />
        </OrchestratorFormWrapper> // it is required to pass the fragment so rjsf won't generate a Submit button
      ) : (
        <SingleStepForm
          schema={schema}
          onChange={onChange}
          formData={formData}
          uiSchema={uiSchema}
        />
      )}
    </StepperContextProvider>
  );
};

export default OrchestratorForm;
