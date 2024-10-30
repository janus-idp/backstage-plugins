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
      <Paper square elevation={0}>
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
