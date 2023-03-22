import React from 'react';
import {
  FormContextType,
  ObjectFieldTemplateProps,
  RJSFSchema,
  StrictRJSFSchema,
  canExpand,
  getUiOptions,
  titleId,
} from '@rjsf/utils';
import { Box, Grid, makeStyles, Typography } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { getGridSize } from './getGridsize';

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  item: {
    marginBottom: theme.spacing(2),
    '& .field-array  .MuiPaper-root': {
      boxShadow: 'none',
    },
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

  const currentUiSchema = uiSchema?.[properties[0].content.key as string];

  const isContainer =
    properties.length === 1 && currentUiSchema?.['ui:hidden'] === true;

  // TODO: reinstate when there is a task description
  const showTitle = false; // uiSchema?.['ui:show-title'];

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
        <Grid container spacing={2} className={styles.container}>
          {properties.map((element, index) => {
            const container =
              element.content.props.uiSchema['ui:hidden'] === true;

            if (container) {
              return (
                <Grid item xs={12} className={styles.item}>
                  {element.content}
                </Grid>
              );
            }

            return element.hidden ? (
              element.content
            ) : (
              <Grid
                item
                key={index}
                className={styles.item}
                {...getGridSize(uiSchema?.[element.content?.key as string])}
              >
                {element.content}
              </Grid>
            );
          })}
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
