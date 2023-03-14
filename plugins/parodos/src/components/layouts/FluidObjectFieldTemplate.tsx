import React from 'react';
import Grid from '@mui/material/Grid';
import {
  FormContextType,
  ObjectFieldTemplateProps,
  RJSFSchema,
  StrictRJSFSchema,
  canExpand,
  getUiOptions,
  titleId,
} from '@rjsf/utils';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(2),
  },
  item: {
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: '1rem',
    fontWeight: theme.typography
      .fontWeightRegular as CSSProperties['fontWeight'],
  },
}));

export function FluidObjectFieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: ObjectFieldTemplateProps<T, S, F>) {
  const {
    description,
    title,
    properties,
    disabled,
    readonly,
    uiSchema,
    idSchema,
    schema,
    formData,
    onAddClick,
    registry,
  } = props;
  const uiOptions = getUiOptions(uiSchema);

  const styles = useStyles();

  const {
    ButtonTemplates: { AddButton },
  } = registry.templates;

  const isContainer =
    properties.length === 1 &&
    uiSchema?.[properties[0].content.key as string]['ui:hidden'] === true;

  const showTitle = uiSchema?.['ui:show-title'];

  return (
    <>
      {showTitle && (
        <Box id={titleId(idSchema)} mb={1} mt={1}>
          <Typography variant="h5" className={styles.title}>
            {title}
          </Typography>
        </Box>
      )}
      {(uiOptions.description || description) &&
        {
          /* TODO: could add description here */
        }}
      {isContainer ? (
        properties[0].content
      ) : (
        <Grid container spacing={2} className={styles.item}>
          {properties.map((element, index) =>
            element.hidden ? (
              element.content
            ) : (
              <Grid
                item
                xs={12}
                md={6}
                lg={4}
                key={index}
                style={{ marginBottom: '10px' }}
              >
                {element.content}
              </Grid>
            ),
          )}
          {canExpand(schema, uiSchema, formData) && (
            <Grid container justifyContent="flex-end">
              <Grid item>
                <AddButton
                  className="object-property-expand"
                  onClick={onAddClick(schema)}
                  disabled={disabled || readonly}
                  uiSchema={uiSchema}
                  registry={registry}
                />
              </Grid>
            </Grid>
          )}
        </Grid>
      )}
    </>
  );
}
