import React from 'react';

type WorkflowParametersContextType = {
  getParamValue: (key: string) => string | undefined;
  setParamValue: (key: string, value: string) => void;
};

const noop = () => {
  return undefined;
};

export const WorkflowParametersContext =
  React.createContext<WorkflowParametersContextType>({
    getParamValue: noop,
    setParamValue: noop,
  });

export const WorkflowParametersContextProvider: React.FC = ({ children }) => {
  const [workflowParameters, setWorkflowParameters] = React.useState<
    Record<string /* param key */, string /* param value */>
  >({});

  const getParamValue: WorkflowParametersContextType['getParamValue'] = (
    key: string,
  ) => workflowParameters[key];

  const setParamValue: WorkflowParametersContextType['setParamValue'] = (
    key: string,
    value: string,
  ) => {
    setWorkflowParameters({ ...workflowParameters, [key]: value });
  };

  return (
    <WorkflowParametersContext.Provider
      value={{
        getParamValue,
        setParamValue,
      }}
    >
      {children}
    </WorkflowParametersContext.Provider>
  );
};
