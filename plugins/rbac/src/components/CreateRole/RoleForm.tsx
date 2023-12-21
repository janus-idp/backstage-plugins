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
import { FormikErrors, FormikHelpers, useFormik } from 'formik';

import { rbacApiRef } from '../../api/RBACBackendClient';
import { CreateRoleError, MemberEntity } from '../../types';
import {
  getPermissionPoliciesData,
  getRoleData,
  validationSchema,
} from '../../utils/create-role-utils';
import { useToast } from '../ToastContext';
import { AddedMembersTable } from './AddedMembersTable';
import { AddMembersForm } from './AddMembersForm';
import { PermissionPoliciesForm } from './PermissionPoliciesForm';
import { ReviewStep } from './ReviewStep';
import { RoleDetailsForm } from './RoleDetailsForm';
import { PermissionPolicyRow, RoleFormValues } from './types';

type RoleFormProps = {
  membersData: { members: MemberEntity[]; loading: boolean; error: Error };
  titles: {
    formTitle: string;
    nameAndDescriptionTitle: string;
    usersAndGroupsTitle: string;
    permissionPoliciesTitle: string;
  };
  submitLabel?: string;
  roleName?: string;
  step?: number;
  initialValues: RoleFormValues;
};

export const RoleForm = ({
  roleName,
  step,
  titles,
  membersData,
  submitLabel,
  initialValues,
}: RoleFormProps) => {
  const { setToastMessage } = useToast();
  const [activeStep, setActiveStep] = React.useState<number>(step || 0);
  const navigate = useNavigate();
  const rbacApi = useApi(rbacApiRef);

  const formik = useFormik<RoleFormValues>({
    enableReinitialize: true,
    initialValues,
    validationSchema: validationSchema,
    onSubmit: async (
      values: RoleFormValues,
      formikHelpers: FormikHelpers<RoleFormValues>,
    ) => {
      try {
        const newData = getRoleData(values);
        const oldData = getRoleData(initialValues);

        let res: Response | CreateRoleError;
        if (roleName) {
          res = await rbacApi.updateRole(oldData, newData);
        } else {
          res = await rbacApi.createRole(newData);
        }

        if ((res as CreateRoleError).error) {
          throw new Error(
            `${
              roleName ? 'Unable to edit the role. ' : 'Unable to create role. '
            }${(res as CreateRoleError).error.message}`,
          );
        } else if (roleName) {
          setToastMessage(`Role ${roleName} updated successfully`);
          navigate('/rbac');
        } else {
          const permissionsData = getPermissionPoliciesData(values);
          const permissionsRes: Response | CreateRoleError =
            await rbacApi.createPolicy(permissionsData);
          if ((permissionsRes as unknown as CreateRoleError).error) {
            throw new Error(
              `Role was created successfully but unable to add permissions to the role. ${
                (permissionsRes as unknown as CreateRoleError).error.message
              }`,
            );
          } else {
            setToastMessage(`Role ${newData.name} created successfully`);
            navigate('/rbac');
          }
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
      case 'permissionPoliciesRows': {
        formik.values.permissionPoliciesRows.forEach((_pp, index) => {
          formik.validateField(`permissionPoliciesRows[${index}].plugin`);
          formik.validateField(`permissionPoliciesRows[${index}].permission`);
        });
        return formik.errors.permissionPoliciesRows;
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

  const canNextPermissionPoliciesStep = () => {
    return (
      formik.values.permissionPoliciesRows.filter(pp => !!pp.plugin).length ===
        formik.values.permissionPoliciesRows.length &&
      (!formik.errors.permissionPoliciesRows ||
        (
          formik.errors
            .permissionPoliciesRows as unknown as FormikErrors<PermissionPolicyRow>[]
        )?.filter(err => !!err)?.length === 0)
    );
  };

  const handleBack = () => setActiveStep(Math.max(activeStep - 1, 0));

  const handleReset = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setActiveStep(0);
    formik.handleReset(e);
  };

  return (
    <Card>
      <CardHeader title={titles.formTitle} />
      <Divider />
      <CardContent component="form" onSubmit={formik.handleSubmit}>
        <SimpleStepper activeStep={activeStep}>
          <SimpleStepperStep
            title={titles.nameAndDescriptionTitle}
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
            title={titles.usersAndGroupsTitle}
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
                membersData={membersData}
              />
              <br />
              <AddedMembersTable
                selectedMembers={formik.values.selectedMembers}
                setFieldValue={formik.setFieldValue}
              />
            </Box>
          </SimpleStepperStep>
          <SimpleStepperStep
            title="Add permission policies"
            actions={{
              showNext: true,
              nextText: 'Next',
              canNext: () => canNextPermissionPoliciesStep(),
              onNext: () => handleNext('permissionPoliciesRows'),
              showBack: true,
              backText: 'Back',
              onBack: handleBack,
            }}
          >
            <PermissionPoliciesForm
              permissionPoliciesRows={formik.values.permissionPoliciesRows}
              permissionPoliciesRowsError={
                formik.errors
                  .permissionPoliciesRows as FormikErrors<PermissionPolicyRow>[]
              }
              setFieldValue={formik.setFieldValue}
              setFieldError={formik.setFieldError}
              handleBlur={formik.handleBlur}
            />
          </SimpleStepperStep>
          <SimpleStepperStep title="" end>
            <Paper square elevation={0}>
              <ReviewStep values={formik.values} />
              <br />
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
                {submitLabel || 'Create'}
              </Button>
            </Paper>
          </SimpleStepperStep>
        </SimpleStepper>
        {formik.status?.submitError && (
          <Box>
            <Alert severity="error">{`${formik.status.submitError}`}</Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
