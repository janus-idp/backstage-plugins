import * as React from 'react';
import { useAsync } from 'react-use';

import { Entity, EntityMeta } from '@backstage/catalog-model';
import { WarningPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  PreviewCatalogInfoComponent,
  PreviewPullRequestComponent,
} from '@backstage/plugin-catalog-import';
import {
  catalogApiRef,
  humanizeEntityRef,
} from '@backstage/plugin-catalog-react';

import { makeStyles } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';

import {
  AddRepositoriesFormValues,
  PullRequestPreview,
  PullRequestPreviewData,
} from '../../types';
import {
  convertKeyValuePairsToString,
  getCustomisedErrorMessage,
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

const componentNameRegex =
  /^([a-zA-Z0-9]+[-_.])*[a-zA-Z0-9]+$|^[a-zA-Z0-9]{1,63}$/;

export const PreviewPullRequest = ({
  repoName,
  pullRequest,
  setPullRequest,
  formErrors,
  setFormErrors,
  others,
}: {
  repoName: string;
  pullRequest: PullRequestPreviewData;
  formErrors: PullRequestPreviewData;
  others?: {
    addPaddingTop?: boolean;
  };
  setPullRequest: (pullRequest: PullRequestPreviewData) => void;
  setFormErrors: (pullRequest: PullRequestPreviewData) => void;
}) => {
  const contentClasses = useDrawerContentStyles();
  const { values, status } = useFormikContext<AddRepositoriesFormValues>();
  const catalogApi = useApi(catalogApiRef);
  const approvalTool =
    values.approvalTool === 'git' ? 'Pull request' : 'ServiceNow ticket';

  const [entityOwner, setEntityOwner] = React.useState<string | null>(
    pullRequest[repoName]?.entityOwner ?? '',
  );
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
  React.useEffect(() => {
    const newFormErrors = {
      ...formErrors,
      [repoName]: {
        ...formErrors?.[repoName],
        entityOwner: 'Entity owner is missing',
      },
    };

    if (
      (entityOwner === null || !pullRequest[repoName]?.entityOwner) &&
      !pullRequest[repoName]?.useCodeOwnersFile
    ) {
      if (JSON.stringify(formErrors) !== JSON.stringify(newFormErrors)) {
        setFormErrors(newFormErrors);
      }
    }
  }, [entityOwner, pullRequest, setFormErrors, formErrors, repoName]);

  const updatePullRequestKeyValuePairFields = (
    field: string,
    value: string,
    yamlKey: string,
  ) => {
    const yamlUpdate: Entity = { ...pullRequest[repoName]?.yaml };

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
      [repoName]: {
        ...pullRequest[repoName],
        [field]: value,
        yaml: yamlUpdate,
      },
    });
  };

  const updateFieldAndErrors = (
    field: string,
    value: string,
    errorMessage: string,
  ) => {
    setPullRequest({
      ...pullRequest,
      [repoName]: {
        ...pullRequest[repoName],
        [field]: value,
        ...(field === 'componentName'
          ? {
              yaml: {
                ...pullRequest[repoName]?.yaml,
                metadata: {
                  ...pullRequest[repoName]?.yaml.metadata,
                  name: value,
                },
              },
            }
          : {}),
      },
    });

    if (!value) {
      setFormErrors({
        ...formErrors,
        [repoName]: {
          ...formErrors?.[repoName],
          [field]: errorMessage,
        },
      });
    } else if (field === 'componentName' && !componentNameRegex.exec(value)) {
      setFormErrors({
        ...formErrors,
        [repoName]: {
          ...formErrors?.[repoName],
          [field]: `"${value}" is not valid; expected a string that is sequences of [a-zA-Z0-9] separated by any of [-_.], at most 63 characters in total. To learn more about catalog file format, visit: https://github.com/backstage/backstage/blob/master/docs/architecture-decisions/adr002-default-catalog-file-format.md`,
        },
      });
    } else {
      const err = { ...formErrors };
      delete err[repoName]?.[field as keyof PullRequestPreview];
      setFormErrors(err);
    }
  };

  const handleChange = (
    event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const targetName = event.target.name
      .split('.')
      .find(s =>
        [
          'prTitle',
          'prDescription',
          'componentName',
          'prAnnotations',
          'prLabels',
          'prSpec',
          'entityOwner',
        ].includes(s),
      );

    if (!targetName) return;

    const inputValue = event.target.value;
    switch (targetName) {
      case 'prTitle':
        updateFieldAndErrors(
          'prTitle',
          inputValue,
          `${approvalTool} title is missing`,
        );
        break;
      case 'prDescription':
        updateFieldAndErrors(
          'prDescription',
          inputValue,
          `${approvalTool} description is missing`,
        );
        break;
      case 'entityOwner':
        setPullRequest({
          ...pullRequest,
          [repoName]: {
            ...pullRequest[repoName],
            entityOwner: inputValue,
            yaml: {
              ...pullRequest[repoName]?.yaml,
              spec: {
                ...pullRequest[repoName]?.yaml.spec,
                ...(inputValue ? { owner: inputValue } : {}),
              },
            },
          },
        });
        break;
      case 'componentName':
        updateFieldAndErrors(
          'componentName',
          inputValue,
          'Component name is missing',
        );

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
        pullRequest?.[repoName]?.prAnnotations ??
        convertKeyValuePairsToString(
          pullRequest?.[repoName]?.yaml?.metadata?.annotations,
        ),
    },
    {
      label: 'Labels',
      name: 'prLabels',
      value:
        pullRequest?.[repoName]?.prLabels ??
        convertKeyValuePairsToString(
          pullRequest?.[repoName]?.yaml?.metadata?.labels,
        ),
    },
    {
      label: 'Spec',
      name: 'prSpec',
      value:
        pullRequest?.[repoName]?.prSpec ??
        convertKeyValuePairsToString(
          pullRequest?.[repoName]?.yaml?.spec as Record<string, string>,
        ),
    },
  ];

  const error = status?.errors?.[repoName];
  const info = status?.infos?.[repoName];
  if (info && !error) {
    // prioritize error over info
    return (
      <Box marginTop={others?.addPaddingTop ? 2 : 0}>
        <WarningPanel
          severity="info"
          title="Important message for your repository"
          message={getCustomisedErrorMessage(info.error.message)}
        />
      </Box>
    );
  }

  return (
    <>
      {error && (
        <Box marginTop={others?.addPaddingTop ? 2 : 0}>
          <WarningPanel
            severity="error"
            title="Failed to create PR"
            message={getCustomisedErrorMessage(error.error.message)}
          />
        </Box>
      )}
      <Box marginTop={2}>
        <Typography variant="h6">{`${approvalTool} details`}</Typography>
      </Box>

      <TextField
        label={`${approvalTool} title`}
        placeholder="Add Backstage catalog entity descriptor files"
        variant="outlined"
        margin="normal"
        fullWidth
        name={`repositories.${pullRequest[repoName]?.componentName}.prTitle`}
        value={pullRequest?.[repoName]?.prTitle}
        onChange={handleChange}
        error={!!formErrors?.[repoName]?.prTitle}
        required
      />

      <TextField
        label={`${approvalTool} body`}
        placeholder="A describing text with Markdown support"
        margin="normal"
        variant="outlined"
        fullWidth
        onChange={handleChange}
        name={`repositories.${pullRequest[repoName]?.componentName}.prDescription`}
        value={pullRequest?.[repoName]?.prDescription}
        error={!!formErrors?.[repoName]?.prDescription}
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
        value={pullRequest?.[repoName]?.componentName}
        name={`repositories.${pullRequest[repoName]?.componentName}.componentName`}
        error={!!formErrors?.[repoName]?.componentName}
        helperText={
          formErrors?.[repoName]?.componentName
            ? formErrors?.[repoName]?.componentName
            : ''
        }
        fullWidth
        required
      />
      <br />
      <br />

      {!pullRequest?.[repoName]?.useCodeOwnersFile && (
        <Autocomplete
          options={entities || []}
          value={entityOwner || ''}
          loading={entitiesLoading}
          loadingText="Loading groups and users"
          onChange={(_event: React.ChangeEvent<{}>, value: string | null) => {
            setEntityOwner(value);
            handleChange({
              target: { name: 'entityOwner', value },
            } as any);
          }}
          onInputChange={(_e, newSearch: string) => {
            setEntityOwner(newSearch || '');
            handleChange({
              target: { name: 'entityOwner', value: newSearch },
            } as any);
            if (!newSearch && !pullRequest?.[repoName]?.useCodeOwnersFile) {
              setFormErrors({
                ...formErrors,
                [repoName]: {
                  ...formErrors?.[repoName],
                  entityOwner: 'Entity Owner is required',
                },
              });
            } else {
              const err = { ...formErrors };
              delete err[repoName]?.entityOwner;
              setFormErrors(err);
            }
          }}
          renderInput={params => (
            <TextField
              {...params}
              variant="outlined"
              error={!!formErrors?.[repoName]?.entityOwner}
              label="Entity owner"
              placeholder="groups and users"
              helperText={
                formErrors?.[repoName]?.entityOwner &&
                !pullRequest?.[repoName]?.useCodeOwnersFile
                  ? 'Entity owner is required'
                  : 'Select an owner from the list or enter a reference to a Group or a User'
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
            checked={pullRequest?.[repoName]?.useCodeOwnersFile}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const pr = {
                ...pullRequest,
                [repoName]: {
                  ...pullRequest[repoName],
                  useCodeOwnersFile: event.target.checked,
                },
              };

              delete pr[repoName]?.entityOwner;
              delete pr[repoName]?.yaml?.spec?.owner;

              setPullRequest(pr);
              if (event.target.checked) {
                const err = { ...formErrors };
                delete err[repoName]?.entityOwner;
                setFormErrors(err);
              }
            }}
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
      {keyValueTextFields.map(field => (
        <KeyValueTextField
          key={field.name}
          label={field.label}
          name={`repositories.${pullRequest[repoName]?.componentName}.${field.name}`}
          value={field.value ?? ''}
          onChange={handleChange}
          setFormErrors={setFormErrors}
          formErrors={formErrors}
          repoName={repoName}
        />
      ))}
      <Box marginTop={2}>
        <Typography variant="h6">
          Preview {`${approvalTool.toLowerCase()}`}
        </Typography>
      </Box>

      <PreviewPullRequestComponent
        title={pullRequest?.[repoName]?.prTitle ?? ''}
        description={pullRequest?.[repoName]?.prDescription ?? ''}
        classes={{
          card: contentClasses.previewCard,
          cardContent: contentClasses.previewCardContent,
        }}
      />

      <Box marginTop={2} marginBottom={1}>
        <Typography variant="h6">Preview entities</Typography>
      </Box>

      <PreviewCatalogInfoComponent
        entities={[pullRequest?.[repoName]?.yaml]}
        repositoryUrl={values.repositories[repoName]?.repoUrl as string}
        classes={{
          card: contentClasses.previewCard,
          cardContent: contentClasses.previewCardContent,
        }}
      />
    </>
  );
};
