import React from 'react';
import { ValidatorType } from '../components/workflow/validators';

type ParamValidationType = string;

type WorkflowParametersContextType = {
  getParamValue: (key: string) => string | undefined;
  setParamValue: (key: string, value: string, validator: ValidatorType) => void;
  getParamValidation: (key: string) => ParamValidationType | undefined;
};

const noop = () => {
  return undefined;
};

export const WorkflowParametersContext =
  React.createContext<WorkflowParametersContextType>({
    getParamValue: noop,
    setParamValue: noop,
    getParamValidation: noop,
  });

export const WorkflowParametersContextProvider: React.FC = ({ children }) => {
  const [workflowParameters, setWorkflowParameters] = React.useState<
    Record<
      string /* param key */,
      {
        value: string;
        validation?: ParamValidationType;
      }
    >
  >({});

  const getParamValue: WorkflowParametersContextType['getParamValue'] = (
    key: string,
  ) => workflowParameters[key]?.value;

  const getParamValidation: WorkflowParametersContextType['getParamValidation'] =
    (key: string) => workflowParameters[key]?.validation;

  const setParamValue: WorkflowParametersContextType['setParamValue'] = (
    key: string,
    value: string,
    validator: ValidatorType,
  ) => {
    setWorkflowParameters({
      ...workflowParameters,
      [key]: { value, validation: validator(value) },
    });
  };

  return (
    <WorkflowParametersContext.Provider
      value={{
        getParamValue,
        setParamValue,
        getParamValidation,
      }}
    >
      {children}
    </WorkflowParametersContext.Provider>
  );
};
