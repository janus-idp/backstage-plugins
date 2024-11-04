import * as React from 'react';
import { useAsync } from 'react-use';

import { Entity, EntityMeta } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  PreviewCatalogInfoComponent,
  PreviewPullRequestComponent,
} from '@backstage/plugin-catalog-import';
import {
  catalogApiRef,
  humanizeEntityRef,
} from '@backstage/plugin-catalog-react';

import { Checkbox, FormHelperText, makeStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { FormikErrors, useFormik, useFormikContext } from 'formik';

import {
  AddRepositoriesFormValues,
  PullRequestPreview,
  PullRequestPreviewData,
} from '../../types';
import {
  convertKeyValuePairsToString,
  getValidationSchema,
  getYamlKeyValuePairs,
} from '../../utils/repository-utils';
import KeyValueTextField from './KeyValueTextField';

const useDrawerContentStyles = makeStyles(theme => ({
  previewCard: {
    marginTop: theme.spacing(1),
  },
  previewCardContent: {
    paddingTop: 0,
  },
}));

export const PreviewPullRequestForm = ({
  repoId,
  repoUrl,
  pullRequest,
  setPullRequest,
  formErrors,
  setFormErrors,
}: {
  repoId: string;
  repoUrl: string;
  pullRequest: PullRequestPreviewData;
  formErrors: PullRequestPreviewData;
  setPullRequest: (pullRequest: PullRequestPreviewData) => void;
  setFormErrors: (pullRequest: PullRequestPreviewData) => void;
}) => {
  const contentClasses = useDrawerContentStyles();
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  const catalogApi = useApi(catalogApiRef);

  const approvalTool =
    values.approvalTool === 'git' ? 'Pull request' : 'ServiceNow ticket';

  const formik = useFormik<PullRequestPreview>({
    enableReinitialize: true,
    initialValues: pullRequest[repoId],
    initialErrors: formErrors?.[
      repoId
    ] as any as FormikErrors<PullRequestPreview>,
    validationSchema: getValidationSchema(approvalTool),
    onSubmit: () => {},
  });

  const { loading: entitiesLoading, value: entities } = useAsync(async () => {
    const allEntities = await catalogApi.getEntities({
      filter: {
        kind: ['group', 'user'],
      },
    });

    return allEntities.items
      .map(e => humanizeEntityRef(e, { defaultNamespace: 'true' }))
      .sort((a, b) => a.localeCompare(b));
  });

  const updatePullRequestKeyValuePairFields = (
    field: string,
    value: string,
    yamlKey: string,
  ) => {
    const yamlUpdate: Entity = { ...formik.values?.yaml };

    if (value.length === 0) {
      if (yamlKey.includes('.')) {
        // annotations or labels
        const [key, subKey] = yamlKey.split('.');
        if ((yamlUpdate[key as keyof Entity] as EntityMeta)?.[subKey]) {
          delete (yamlUpdate[key as keyof Entity] as EntityMeta)[subKey];
        }
      } else {
        // specs
        delete yamlUpdate[yamlKey as keyof Entity];
      }
    } else if (yamlKey.includes('.')) {
      const [key, subKey] = yamlKey.split('.');
      (yamlUpdate[key as keyof Entity] as EntityMeta)[subKey] =
        getYamlKeyValuePairs(value);
    } else {
      yamlUpdate.spec = getYamlKeyValuePairs(value);
    }

    setPullRequest({
      ...pullRequest,
      [repoId]: {
        ...formik.values,
        [field]: value,
        yaml: yamlUpdate,
      },
    });
  };

  const updateFieldAndErrors = (field: string, value: string) => {
    if (formik.values?.[field as keyof PullRequestPreview] !== value) {
      formik.setFieldValue(field, value);
    }

    const pr: PullRequestPreviewData = {
      [repoId]: {
        ...formik.values,
        [field]: value,
        ...(field === 'componentName'
          ? {
              yaml: {
                ...formik.values?.yaml,
                metadata: {
                  ...formik.values?.yaml.metadata,
                  name: value,
                },
              },
            }
          : {}),
        ...(field === 'entityOwner'
          ? {
              yaml: {
                ...formik.values?.yaml,
                spec: {
                  ...formik.values?.yaml.spec,
                  owner: value,
                },
              },
            }
          : {}),
      },
    };
    setPullRequest({ ...pullRequest, ...pr });
  };

  const handleChange = (
    event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const targetName = event.target.name;

    if (!targetName) return;
    const inputValue = event.target.value;
    switch (targetName) {
      case 'prTitle':
      case 'prDescription':
      case 'entityOwner':
      case 'componentName':
      case 'useCodeOwnersFile':
        updateFieldAndErrors(targetName, inputValue);
        break;

      case 'prAnnotations':
        updatePullRequestKeyValuePairFields(
          'prAnnotations',
          inputValue,
          'metadata.annotations',
        );
        break;
      case 'prLabels':
        updatePullRequestKeyValuePairFields(
          'prLabels',
          inputValue,
          'metadata.labels',
        );
        break;
      case 'prSpec':
        updatePullRequestKeyValuePairFields('prSpec', inputValue, 'spec');
        break;
      default:
        break;
    }
  };

  const keyValueTextFields = [
    {
      label: 'Annotations',
      name: 'prAnnotations',
      value:
        formik.values?.prAnnotations ??
        convertKeyValuePairsToString(
          formik.values?.yaml?.metadata?.annotations,
        ),
    },
    {
      label: 'Labels',
      name: 'prLabels',
      value:
        formik.values?.prLabels ??
        convertKeyValuePairsToString(formik.values?.yaml?.metadata?.labels),
    },
    {
      label: 'Spec',
      name: 'prSpec',
      value:
        formik.values?.prSpec ??
        convertKeyValuePairsToString(
          formik.values?.yaml?.spec as Record<string, string>,
        ),
    },
  ];

  React.useEffect(() => {
    const err = {
      ...formErrors,
      [repoId]: formik.errors as any as PullRequestPreview,
    };

    if (!formik.errors) {
      delete err[repoId];
    }

    setFormErrors(err);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.errors]);

  return (
    <>
      <Box marginTop={2}>
        <Typography variant="h6">{`${approvalTool} details`}</Typography>
      </Box>

      <TextField
        label={`${approvalTool} title`}
        placeholder="Add Backstage catalog entity descriptor files"
        variant="outlined"
        margin="normal"
        fullWidth
        name="prTitle"
        value={formik.values?.prTitle}
        onChange={handleChange}
        error={!!formik.errors?.prTitle}
        helperText={formik.errors?.prTitle}
        required
      />

      <TextField
        label={`${approvalTool} body`}
        placeholder="A describing text with Markdown support"
        margin="normal"
        variant="outlined"
        fullWidth
        onChange={handleChange}
        name="prDescription"
        value={formik.values?.prDescription}
        error={!!formik.errors?.prDescription}
        helperText={formik.errors?.prDescription}
        multiline
        required
      />

      <Box marginTop={2}>
        <Typography variant="h6">Entity configuration</Typography>
      </Box>

      <TextField
        label="Name of the created component"
        placeholder="Component Name"
        margin="normal"
        variant="outlined"
        onChange={handleChange}
        name="componentName"
        value={formik.values?.componentName}
        error={!!formik.errors?.componentName}
        helperText={formik.errors?.componentName}
        fullWidth
        required
      />
      <br />
      <br />

      {!formik.values?.useCodeOwnersFile && (
        <Autocomplete
          options={entities || []}
          value={formik.values?.entityOwner}
          loading={entitiesLoading}
          loadingText="Loading groups and users"
          onChange={(_event, value) =>
            handleChange({
              target: { name: 'entityOwner', value },
            } as any)
          }
          onInputChange={(_event, value) =>
            handleChange({
              target: { name: 'entityOwner', value },
            } as any)
          }
          renderInput={params => (
            <TextField
              {...params}
              name="entityOwner"
              variant="outlined"
              error={!!formik.errors?.entityOwner}
              label="Entity owner"
              placeholder="groups and users"
              helperText={
                formik.errors?.entityOwner ||
                'Select an owner from the list or enter a reference to a Group or a User'
              }
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {entitiesLoading ? (
                      <CircularProgress color="inherit" size="1em" />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              required
            />
          )}
        />
      )}

      <FormControlLabel
        control={
          <Checkbox
            name="useCodeOwnersFile"
            checked={formik.values?.useCodeOwnersFile}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChange({
                target: {
                  name: 'useCodeOwnersFile',
                  value: event.target.checked,
                },
              } as any)
            }
          />
        }
        label={
          <>
            Use <em>CODEOWNERS</em> file as Entity Owner
          </>
        }
      />
      <FormHelperText>
        WARNING: This may fail if no CODEOWNERS file is found at the target
        location.
      </FormHelperText>
      {keyValueTextFields.map(field => {
        return (
          <KeyValueTextField
            key={field.name}
            label={field.label}
            value={field.value ?? ''}
            name={field.name}
            onChange={handleChange}
            setFormErrors={setFormErrors}
            formErrors={formErrors}
            repoId={repoId}
          />
        );
      })}
      <Box marginTop={2}>
        <Typography variant="h6">
          Preview {`${approvalTool.toLowerCase()}`}
        </Typography>
      </Box>

      <PreviewPullRequestComponent
        title={formik.values?.prTitle ?? ''}
        description={formik.values?.prDescription ?? ''}
        classes={{
          card: contentClasses.previewCard,
          cardContent: contentClasses.previewCardContent,
        }}
      />

      <Box marginTop={2} marginBottom={1}>
        <Typography variant="h6">Preview entities</Typography>
      </Box>

      <PreviewCatalogInfoComponent
        entities={[formik.values?.yaml]}
        repositoryUrl={repoUrl}
        classes={{
          card: contentClasses.previewCard,
          cardContent: contentClasses.previewCardContent,
        }}
      />
    </>
  );
};
