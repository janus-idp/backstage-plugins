import React from 'react';

import { Grid, IconButton, Tooltip } from '@material-ui/core';
import Refresh from '@material-ui/icons/Refresh';

type DefaultProps = {
  hideNamespaceSelector?: boolean;
  elements?: JSX.Element[];
  showClusterSelector?: boolean;
  onRefresh: () => void;
};

const defaultStyle: React.CSSProperties = { marginTop: '25px', float: 'left' };
const justReloadStyle: React.CSSProperties = { marginTop: '0', float: 'right' };

export const DefaultSecondaryMasthead: React.FC<DefaultProps> = (
  props: DefaultProps,
) => {
  return (
    <Grid container spacing={1} direction="row">
      {props.elements?.map(element => {
        return element;
      })}
      <Grid item xs={props.elements && props.elements.length > 0 ? 1 : 12}>
        <Tooltip
          title="Refresh"
          style={
            props.elements && props.elements.length > 0
              ? defaultStyle
              : justReloadStyle
          }
        >
          <IconButton
            color="primary"
            aria-label="upload picture"
            component="label"
            onClick={props.onRefresh}
          >
            <Refresh />
          </IconButton>
        </Tooltip>
      </Grid>
    </Grid>
  );
};
