import React from 'react';

export type StepperContext = {
  activeStep: number;
  handleNext: () => void;
  handleBack: () => void;
  reviewStep: React.ReactNode;
  isValidating: boolean;
  handleValidateStarted: () => void;
  handleValidateEnded: () => void;
};

const context = React.createContext<StepperContext | null>(null);

export const useStepperContext = (): StepperContext => {
  const multiStepFormContext = React.useContext(context);
  if (!multiStepFormContext) {
    throw new Error('Context StepperContext is not defined');
  }
  return multiStepFormContext;
};

export const StepperContextProvider = ({
  children,
  reviewStep,
}: {
  children: React.ReactNode;
  reviewStep: React.ReactNode;
}) => {
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [isValidating, setIsValidating] = React.useState<boolean>(false);
  const contextData = React.useMemo(() => {
    return {
      activeStep,
      handleNext: () => {
        setActiveStep(curActiveStep => curActiveStep + 1);
      },
      handleBack: () => setActiveStep(curActiveStep => curActiveStep - 1),
      reviewStep,
      isValidating,
      handleValidateStarted: () => setIsValidating(true),
      handleValidateEnded: () => setIsValidating(false),
    };
  }, [setActiveStep, activeStep, reviewStep, isValidating, setIsValidating]);
  return <context.Provider value={contextData}>{children}</context.Provider>;
};
