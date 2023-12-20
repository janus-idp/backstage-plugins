import React from 'react';

import {
  Box,
  Collapse,
  IconButton,
  makeStyles,
  TableCell,
  TableRow,
  Theme,
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { Timestamp } from '@patternfly/react-core';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { OpenRowStatus, tektonGroupColor } from '../../types/types';
import { pipelineRunDuration } from '../../utils/tekton-utils';
import { PipelineRunVisualization } from '../pipeline-topology';
import PipelineRunRowActions from './PipelineRunRowActions';
import PipelineRunTaskStatus from './PipelineRunTaskStatus';
import PlrStatus from './PlrStatus';
import ResourceBadge from './ResourceBadge';

import './PipelineRunRow.css';

const useStyles = makeStyles((theme: Theme) => ({
  plrRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: `${theme.palette.background.paper}`,
    },
  },
  plrVisRow: {
    borderBottom: `1px solid ${theme.palette.grey.A100}`,
  },
}));

type PipelineRunRowProps = {
  row: PipelineRunKind;
  startTime: string;
  isExpanded?: boolean;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<OpenRowStatus>>;
};

type PipelineRunNameProps = { row: PipelineRunKind };

const PipelineRunName = ({ row }: PipelineRunNameProps) => {
  const name = row.metadata?.name;

  return (
    <div>
      {name ? (
        <ResourceBadge color={tektonGroupColor} abbr="PLR" name={name || ''} />
      ) : (
        '-'
      )}
    </div>
  );
};

export const PipelineRunRow = ({
  row,
  startTime,
  isExpanded = false,
  open,
  setOpen,
}: PipelineRunRowProps) => {
  const classes = useStyles();
  const uid = row.metadata?.uid;

  React.useEffect(() => {
    return setOpen((val: OpenRowStatus) => {
      return {
        ...val,
        ...(uid && { [uid]: isExpanded }),
      };
    });
  }, [isExpanded, uid, setOpen]);

  const expandCollapseClickHandler = () => {
    setOpen((val: OpenRowStatus) => {
      return {
        ...val,
        ...(uid && {
          [uid]: !val[uid],
        }),
      };
    });
  };

  return (
    <>
      <TableRow key={uid} className={classes.plrRow}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={expandCollapseClickHandler}
          >
            {open ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="left">
          <PipelineRunName row={row} />
        </TableCell>
        <TableCell align="left">
          <PlrStatus obj={row} />
        </TableCell>
        <TableCell align="left">
          <PipelineRunTaskStatus pipelineRun={row} />
        </TableCell>
        <TableCell align="left">
          {startTime ? (
            <Timestamp
              className="bs-tkn-timestamp"
              date={new Date(startTime)}
            />
          ) : (
            '-'
          )}
        </TableCell>
        <TableCell align="left">{pipelineRunDuration(row)}</TableCell>
        <TableCell align="left">
          <PipelineRunRowActions pipelineRun={row} />
        </TableCell>
      </TableRow>
      <TableRow className={classes.plrVisRow}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <PipelineRunVisualization pipelineRunName={row.metadata?.name} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
