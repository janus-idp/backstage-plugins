/* eslint-disable no-console */
import React, { useState } from 'react';
import {
  getTemplate,
  getUiOptions,
  ArrayFieldTemplateProps,
  ArrayFieldTemplateItemType,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import {
  Button,
  makeStyles,
  Step,
  StepContent,
  StepLabel,
  Stepper,
} from '@material-ui/core';
import { IChangeEvent } from '@rjsf/core-v5';

const useStyles = makeStyles(_theme => ({
  stepper: {
    background: '#F4F4F4;',
  },
  stepLabel: {
    '& span': {
      fontSize: '1.25rem',
    },
  },
  container: {},
}));

/** The `ArrayFieldTemplate` component is the template used to render all items in an array.
 *
 * @param props - The `ArrayFieldTemplateItemType` props for the component
 */
export default function ArrayFieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: ArrayFieldTemplateProps<T, S, F>) {
  const {
    disabled,
    idSchema,
    uiSchema,
    items,
    readonly,
    registry,
    required,
    schema,
    title,
  } = props;
  const uiOptions = getUiOptions(uiSchema);
  const ArrayFieldItemTemplate = getTemplate<'ArrayFieldItemTemplate', T, S, F>(
    'ArrayFieldItemTemplate',
    registry,
    uiOptions,
  );
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = async (data: IChangeEvent, e: React.FormEvent<any>) => {
    // setFormState(current => ({ ...current, ...data.formData }));

    console.log({data,e})

    if (activeStep === items.length - 1) {
      console.log('we are don')
      // await onSubmit(data, e);
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const styles = useStyles();
  return (
    <div className={styles.container}>
      <Stepper activeStep={activeStep} orientation="vertical" className={styles.stepper}>
        {items &&
          items.map(
            (
              { key, ...itemProps }: ArrayFieldTemplateItemType<T, S, F>,
              index,
            ) => (
              <Step key={index}>
                <StepLabel
                  StepIconProps={{ icon: String.fromCharCode(65 + index) }}
                  className={styles.stepLabel}
                >
                  {uiOptions.title || title}
                </StepLabel>
                <StepContent key={index}>
                  <>
                    <ArrayFieldItemTemplate key={key} {...itemProps} />
                    <div>
                      <Button
                        disabled={activeStep === 0}
                        // className={styles.previous}
                        onClick={() => setActiveStep((a) => activeStep === 0 ? 0 : a - 1)}
                      >
                        PREVIOUS
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        onClick={handleNext}
                        // className={styles.next}
                      >
                        NEXT
                      </Button>
                    </div>
                  </>
                </StepContent>
              </Step>
            ),
          )}
      </Stepper>
    </div>
  );
}
