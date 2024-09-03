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
import { useFormikContext } from 'formik';

import {
  AddRepositoriesFormValues,
  PullRequestPreview,
  PullRequestPreviewData,
} from '../../types';
import {
  componentNameRegex,
  convertKeyValuePairsToString,
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
  entityOwner,
  setEntityOwner,
}: {
  repoId: string;
  repoUrl: string;
  pullRequest: PullRequestPreviewData;
  formErrors: PullRequestPreviewData;
  entityOwner: string;
  setEntityOwner: (name: string) => void;
  setPullRequest: (pullRequest: PullRequestPreviewData) => void;
  setFormErrors: (pullRequest: PullRequestPreviewData) => void;
}) => {
  const contentClasses = useDrawerContentStyles();
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  const catalogApi = useApi(catalogApiRef);

  const approvalTool =
    values.approvalTool === 'git' ? 'Pull request' : 'ServiceNow ticket';

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
      [repoId]: {
        ...formErrors?.[repoId],
        entityOwner: 'Entity owner is missing',
      },
    };

    if (
      Object.keys(pullRequest || {}).length > 0 &&
      !pullRequest[repoId]?.entityOwner &&
      !pullRequest[repoId]?.useCodeOwnersFile
    ) {
      if (JSON.stringify(formErrors) !== JSON.stringify(newFormErrors)) {
        setFormErrors(newFormErrors);
      }
    } else if (pullRequest[repoId]?.entityOwner) {
      setEntityOwner(pullRequest[repoId].entityOwner || 'user:default/guest');
    }
  }, [setFormErrors, setEntityOwner, formErrors, repoId, pullRequest]);

  const updatePullRequestKeyValuePairFields = (
    field: string,
    value: string,
    yamlKey: string,
  ) => {
    const yamlUpdate: Entity = { ...pullRequest[repoId]?.yaml };

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
        ...pullRequest[repoId],
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
      [repoId]: {
        ...pullRequest[repoId],
        [field]: value,
        ...(field === 'componentName'
          ? {
              yaml: {
                ...pullRequest[repoId]?.yaml,
                metadata: {
                  ...pullRequest[repoId]?.yaml.metadata,
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
        [repoId]: {
          ...formErrors?.[repoId],
          [field]: errorMessage,
        },
      });
    } else if (field === 'componentName' && !componentNameRegex.exec(value)) {
      setFormErrors({
        ...formErrors,
        [repoId]: {
          ...formErrors?.[repoId],
          [field]: `"${value}" is not valid; expected a string that is sequences of [a-zA-Z0-9] separated by any of [-_.], at most 63 characters in total. To learn more about catalog file format, visit: https://github.com/backstage/backstage/blob/master/docs/architecture-decisions/adr002-default-catalog-file-format.md`,
        },
      });
    } else {
      const err = { ...formErrors };
      delete err[repoId]?.[field as keyof PullRequestPreview];
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
          [repoId]: {
            ...pullRequest[repoId],
            entityOwner: inputValue,
            yaml: {
              ...pullRequest[repoId]?.yaml,
              spec: {
                ...pullRequest[repoId]?.yaml.spec,
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
        pullRequest[repoId]?.prAnnotations ??
        convertKeyValuePairsToString(
          pullRequest[repoId]?.yaml?.metadata?.annotations,
        ),
    },
    {
      label: 'Labels',
      name: 'prLabels',
      value:
        pullRequest[repoId]?.prLabels ??
        convertKeyValuePairsToString(
          pullRequest[repoId]?.yaml?.metadata?.labels,
        ),
    },
    {
      label: 'Spec',
      name: 'prSpec',
      value:
        pullRequest[repoId]?.prSpec ??
        convertKeyValuePairsToString(
          pullRequest[repoId]?.yaml?.spec as Record<string, string>,
        ),
    },
  ];

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
        name={`repositories.${pullRequest[repoId]?.componentName}.prTitle`}
        value={pullRequest[repoId]?.prTitle}
        onChange={handleChange}
        error={!!formErrors?.[repoId]?.prTitle}
        required
      />

      <TextField
        label={`${approvalTool} body`}
        placeholder="A describing text with Markdown support"
        margin="normal"
        variant="outlined"
        fullWidth
        onChange={handleChange}
        name={`repositories.${pullRequest[repoId]?.componentName}.prDescription`}
        value={pullRequest[repoId]?.prDescription}
        error={!!formErrors?.[repoId]?.prDescription}
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
        value={pullRequest[repoId]?.componentName}
        name={`repositories.${pullRequest[repoId]?.componentName}.componentName`}
        error={!!formErrors?.[repoId]?.componentName}
        helperText={
          formErrors?.[repoId]?.componentName
            ? formErrors?.[repoId]?.componentName
            : ''
        }
        fullWidth
        required
      />
      <br />
      <br />

      {!pullRequest[repoId]?.useCodeOwnersFile && (
        <Autocomplete
          options={entities || []}
          value={entityOwner || pullRequest[repoId]?.entityOwner || ''}
          loading={entitiesLoading}
          loadingText="Loading groups and users"
          onChange={(_event: React.ChangeEvent<{}>, value: string | null) => {
            setEntityOwner(value || '');
            handleChange({
              target: { name: 'entityOwner', value },
            } as any);
          }}
          onInputChange={(_e, newSearch: string) => {
            setEntityOwner(newSearch || '');
            handleChange({
              target: { name: 'entityOwner', value: newSearch },
            } as any);
            if (!newSearch && !pullRequest[repoId]?.useCodeOwnersFile) {
              setFormErrors({
                ...formErrors,
                [repoId]: {
                  ...formErrors?.[repoId],
                  entityOwner: 'Entity Owner is required',
                },
              });
            } else {
              const err = { ...formErrors };
              delete err[repoId]?.entityOwner;
              setFormErrors(err);
            }
          }}
          renderInput={params => (
            <TextField
              {...params}
              variant="outlined"
              error={!!formErrors?.[repoId]?.entityOwner}
              label="Entity owner"
              placeholder="groups and users"
              helperText={
                formErrors?.[repoId]?.entityOwner &&
                !pullRequest[repoId]?.useCodeOwnersFile
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
            checked={pullRequest[repoId]?.useCodeOwnersFile}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const pr = {
                ...pullRequest,
                [repoId]: {
                  ...pullRequest[repoId],
                  useCodeOwnersFile: event.target.checked,
                },
              };

              delete pr[repoId]?.entityOwner;
              delete pr[repoId]?.yaml?.spec?.owner;

              setPullRequest(pr);
              if (event.target.checked) {
                const err = { ...formErrors };
                delete err[repoId]?.entityOwner;
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
          name={`repositories.${pullRequest[repoId]?.componentName}.${field.name}`}
          value={field.value ?? ''}
          onChange={handleChange}
          setFormErrors={setFormErrors}
          formErrors={formErrors}
          repoId={repoId}
        />
      ))}
      <Box marginTop={2}>
        <Typography variant="h6">
          Preview {`${approvalTool.toLowerCase()}`}
        </Typography>
      </Box>

      <PreviewPullRequestComponent
        title={pullRequest[repoId]?.prTitle ?? ''}
        description={pullRequest[repoId]?.prDescription ?? ''}
        classes={{
          card: contentClasses.previewCard,
          cardContent: contentClasses.previewCardContent,
        }}
      />

      <Box marginTop={2} marginBottom={1}>
        <Typography variant="h6">Preview entities</Typography>
      </Box>

      <PreviewCatalogInfoComponent
        entities={[pullRequest[repoId]?.yaml]}
        repositoryUrl={repoUrl}
        classes={{
          card: contentClasses.previewCard,
          cardContent: contentClasses.previewCardContent,
        }}
      />
    </>
  );
};
