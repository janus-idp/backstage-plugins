import React from 'react';

import { Content, StructuredMetadataTable } from '@backstage/core-components';
import { JsonObject } from '@backstage/types';

import { Box, Button, makeStyles, Paper } from '@material-ui/core';
import type { JSONSchema7 } from 'json-schema';

import generateReviewTableData from '../utils/generateReviewTableData';
import { useStepperContext } from '../utils/StepperContext';
import SubmitButton from './SubmitButton';

const useStyles = makeStyles(theme => ({
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'right',
    marginTop: theme.spacing(2),
  },
  paper: {
    // Workaround since the StructuredMetadataTable is neither responsive as it simply uses <table> nor can be customized via props or styles.
    '& > table > tbody > tr': {
      '& > td:nth-child(1)': {
        minWidth: '10rem',
        width: '25%',
      },
      '& > td:nth-child(2)': {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'left',
      },
    },
  },
}));

const ReviewStep = ({
  busy,
  schema,
  data,
  handleExecute,
}: {
  busy: boolean;
  schema: JSONSchema7;
  data: JsonObject;
  handleExecute: () => void;
}) => {
  const styles = useStyles();
  const { handleBack } = useStepperContext();
  const displayData = React.useMemo<JsonObject>(() => {
    return generateReviewTableData(schema, data);
  }, [schema, data]);
  return (
    <Content noPadding>
      <Paper square elevation={0} className={styles.paper}>
        <StructuredMetadataTable dense metadata={displayData} />
        <Box mb={4} />
        <div className={styles.footer}>
          <Button onClick={handleBack} disabled={busy}>
            Back
          </Button>
          <SubmitButton
            handleClick={handleExecute}
            submitting={busy}
            focusOnMount
          >
            Run
          </SubmitButton>
        </div>
      </Paper>
    </Content>
  );
};

export default ReviewStep;
