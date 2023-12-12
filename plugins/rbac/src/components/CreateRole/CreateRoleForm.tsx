import React from 'react';
import { useNavigate } from 'react-router-dom';

import { SimpleStepper, SimpleStepperStep } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Paper,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { FormikHelpers, useFormik } from 'formik';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { getRoleData, validationSchema } from '../../utils/create-role-utils';
import { AddedMembersTable } from './AddedMembersTable';
import { AddMembersForm } from './AddMembersForm';
import { RoleDetailsForm } from './RoleDetailsForm';
import { CreateRoleFormValues } from './types';

export const CreateRoleForm = () => {
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const navigate = useNavigate();
  const rbacApi = useApi(rbacApiRef);
  const formik = useFormik<CreateRoleFormValues>({
    initialValues: {
      name: '',
      namespace: 'default',
      description: '',
      selectedMembers: [],
    },
    validationSchema: validationSchema,
    onSubmit: async (
      values: CreateRoleFormValues,
      formikHelpers: FormikHelpers<CreateRoleFormValues>,
    ) => {
      try {
        const data = getRoleData(values);
        const res = await rbacApi.createRole(data);
        if (res.status !== 200 && res.status !== 201) {
          const resData = await res.json();
          throw new Error(resData?.error?.message ?? 'Unable to create role');
        } else {
          navigate('/rbac');
        }
      } catch (e) {
        formikHelpers.setStatus({ submitError: e });
      }
    },
  });

  const validateStepField = (fieldName: string) => {
    switch (fieldName) {
      case 'name': {
        formik.validateField(fieldName);
        return formik.errors.name;
      }
      case 'selectedMembers': {
        formik.validateField(fieldName);
        return formik.errors.selectedMembers;
      }
      default:
        return undefined;
    }
  };

  const handleNext = (fieldName?: string) => {
    const error = fieldName && validateStepField(fieldName);
    if (!fieldName || !error) {
      formik.setErrors({});
      const stepNum = Math.min(activeStep + 1, 3);
      setActiveStep(stepNum);
    }
  };

  const handleBack = () => setActiveStep(Math.max(activeStep - 1, 0));

  const handleReset = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setActiveStep(0);
    formik.handleReset(e);
  };

  return (
    <Card>
      <CardHeader title="Create role" />
      <Divider />
      <CardContent component="form" onSubmit={formik.handleSubmit}>
        <SimpleStepper activeStep={activeStep}>
          <SimpleStepperStep
            title="Enter name and description of role"
            actions={{
              showBack: false,
              showNext: true,
              nextText: 'Next',
              canNext: () => !!formik.values.name && !formik.errors.name,
              onNext: () => handleNext('name'),
            }}
          >
            <RoleDetailsForm
              name={formik.values.name}
              description={formik.values.description}
              handleBlur={formik.handleBlur}
              handleChange={formik.handleChange}
              nameError={formik.errors.name}
            />
          </SimpleStepperStep>
          <SimpleStepperStep
            title="Add users and groups"
            actions={{
              showNext: true,
              nextText: 'Next',
              canNext: () =>
                formik.values.selectedMembers?.length > 0 &&
                !formik.errors.selectedMembers,
              onNext: () => handleNext('selectedMembers'),
              showBack: true,
              backText: 'Back',
              onBack: handleBack,
            }}
          >
            <Box>
              <AddMembersForm
                selectedMembers={formik.values.selectedMembers}
                selectedMembersError={formik.errors.selectedMembers as string}
                setFieldValue={formik.setFieldValue}
              />
              <br />
              <AddedMembersTable
                selectedMembers={formik.values.selectedMembers}
                setFieldValue={formik.setFieldValue}
              />
            </Box>
          </SimpleStepperStep>
          <SimpleStepperStep title="" end>
            <Paper elevation={0}>
              <Button onClick={handleBack}>Back</Button>
              <Button onClick={e => handleReset(e)}>Reset</Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={
                  !!formik.errors.name || !!formik.errors.selectedMembers
                }
              >
                Create
              </Button>
            </Paper>
          </SimpleStepperStep>
        </SimpleStepper>
        {formik.status?.submitError && (
          <Box>
            <Alert severity="error">{`Unable to create role. ${formik.status.submitError}`}</Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
