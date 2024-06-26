import * as React from 'react';
import { useAsync } from 'react-use';

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

import { AddRepositoriesFormValues, PullRequestPreviewData } from '../../types';

const useDrawerContentStyles = makeStyles(theme => ({
  previewCard: {
    marginTop: theme.spacing(1),
  },
  previewCardContent: {
    paddingTop: 0,
  },
}));

export const PreviewPullRequest = ({
  repoName,
  pullRequest,
  setPullRequest,
  formErrors,
  setFormErrors,
}: {
  repoName: string;
  pullRequest: PullRequestPreviewData;
  formErrors: PullRequestPreviewData;
  setPullRequest: React.Dispatch<React.SetStateAction<PullRequestPreviewData>>;
  setFormErrors: React.Dispatch<React.SetStateAction<PullRequestPreviewData>>;
}) => {
  const contentClasses = useDrawerContentStyles();
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  const catalogApi = useApi(catalogApiRef);
  const approvalTool =
    values.approvalTool === 'git' ? 'Pull request' : 'ServiceNow ticket';

  const [entityOwner, setEntityOwner] = React.useState<string | null>(
    pullRequest[repoName]?.entityOwner || '',
  );
  const { loading: entitiesLoading, value: entities } = useAsync(async () => {
    const allEntities = await catalogApi.getEntities({
      filter: {
        kind: ['group', 'user'],
      },
    });

    return allEntities.items
      .map(e => humanizeEntityRef(e, { defaultNamespace: 'true' }))
      .sort();
  });
  React.useEffect(() => {
    const newFormErrors = {
      ...formErrors,
      [repoName]: {
        ...formErrors?.[repoName],
        entityOwner: 'Entity owner is missing',
      },
    };

    if (entityOwner === null || !pullRequest[repoName]?.entityOwner) {
      if (JSON.stringify(formErrors) !== JSON.stringify(newFormErrors)) {
        setFormErrors(newFormErrors);
      }
    }
  }, [entityOwner, pullRequest, setFormErrors, formErrors, repoName]);

  const handleChange = (
    event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    if (event.target.name.split('.').find(s => s === 'prTitle')) {
      setPullRequest({
        ...pullRequest,
        [repoName]: {
          ...pullRequest[repoName],
          prTitle: event.target.value,
        },
      });
      if (!event.target.value) {
        setFormErrors({
          ...formErrors,
          [repoName]: {
            ...formErrors?.[repoName],
            prTitle: `${approvalTool} title is missing`,
          },
        });
      } else {
        const err = { ...formErrors };
        delete err[repoName]?.prTitle;
        setFormErrors(err);
      }
    }
    if (event.target.name.split('.').find(s => s === 'prDescription')) {
      setPullRequest({
        ...pullRequest,
        [repoName]: {
          ...pullRequest[repoName],
          prDescription: event.target.value,
        },
      });
      if (!event.target.value) {
        setFormErrors({
          ...formErrors,
          [repoName]: {
            ...formErrors?.[repoName],
            prDescription: `${approvalTool} description is missing`,
          },
        });
      } else {
        const err = { ...formErrors };
        delete err[repoName]?.prDescription;
        setFormErrors(err);
      }
    }
    if (event.target.name.split('.').find(s => s === 'componentName')) {
      setPullRequest({
        ...pullRequest,
        [repoName]: {
          ...pullRequest[repoName],
          componentName: event.target.value,
          yaml: {
            ...pullRequest[repoName]?.yaml,
            metadata: {
              ...pullRequest[repoName]?.yaml.metadata,
              name: event.target.value,
            },
          },
        },
      });
      if (!event.target.value) {
        setFormErrors({
          ...formErrors,
          [repoName]: {
            ...formErrors?.[repoName],
            componentName: 'Component name is missing',
          },
        });
      } else {
        const err = { ...formErrors };
        delete err[repoName]?.componentName;
        setFormErrors(err);
      }
    }
  };

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
        name={`repositories.${pullRequest[repoName].componentName}.prTitle`}
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
        name={`repositories.${pullRequest[repoName].componentName}.prDescription`}
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
        name={`repositories.${pullRequest[repoName].componentName}.componentName`}
        error={!!formErrors?.[repoName]?.componentName}
        fullWidth
        required
      />
      <br />
      <br />

      <Autocomplete
        options={entities || []}
        value={entityOwner || ''}
        loading={entitiesLoading}
        loadingText="Loading groups and users"
        disableClearable
        onChange={(_event: React.ChangeEvent<{}>, value: string | null) => {
          setEntityOwner(value);
          setPullRequest({
            ...pullRequest,
            [repoName]: {
              ...pullRequest[repoName],
              entityOwner: value || '',
            },
          });
        }}
        onInputChange={(_e, newSearch: string) => {
          setEntityOwner(newSearch || '');
          setPullRequest({
            ...pullRequest,
            [repoName]: {
              ...pullRequest[repoName],
              entityOwner: newSearch || '',
            },
          });
          if (!newSearch) {
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
              formErrors?.[repoName]?.entityOwner
                ? 'Entity owner is required'
                : 'Select an owner from the list or enter a reference to a Group or a User'
            }
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {entitiesLoading ? (
                    <CircularProgress color="inherit" size="1em" />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
            required
          />
        )}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={pullRequest?.[repoName]?.useCodeOwnersFile}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setPullRequest({
                ...pullRequest,
                [repoName]: {
                  ...pullRequest[repoName],
                  useCodeOwnersFile: event.target.checked,
                },
              });
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
      <Box marginTop={2}>
        <Typography variant="h6">
          Preview {`${approvalTool.toLowerCase()}`}
        </Typography>
      </Box>

      <PreviewPullRequestComponent
        title={pullRequest?.[repoName]?.prTitle || ''}
        description={pullRequest?.[repoName]?.prDescription || ''}
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
