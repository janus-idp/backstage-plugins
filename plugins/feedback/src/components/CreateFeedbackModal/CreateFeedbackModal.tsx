import React, { useState } from 'react';

import { configApiRef, useApi } from '@backstage/core-plugin-api';

import {
  Button,
  Chip,
  createStyles,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import BugReportOutlined from '@material-ui/icons/BugReportOutlined';
import BugReportTwoToneIcon from '@material-ui/icons/BugReportTwoTone';
import CloseRounded from '@material-ui/icons/CloseRounded';
import SmsOutlined from '@material-ui/icons/SmsOutlined';
import SmsTwoTone from '@material-ui/icons/SmsTwoTone';
import { Alert } from '@material-ui/lab';

import { feedbackApiRef } from '../../api';
import { FeedbackCategory } from '../../models/feedback.model';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > * > *': {
        margin: theme.spacing(1),
        width: '100%',
      },
      padding: '0.5rem',
    },
    actions: {
      '& > *': {
        margin: theme.spacing(1),
      },
      paddingRight: '1rem',
    },
    container: {
      padding: '1rem',
    },
    dialogTitle: {},
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    radioGroup: {
      gap: theme.spacing(3),
    },
  }),
);

const issueTags = [
  'Slow Loading',
  'Not Responsive',
  'Navigation',
  'UI Issues',
  'Other',
];
const feedbackTags = ['Excellent', 'Good', 'Needs Improvement', 'Other'];

export const CreateFeedbackModal = React.forwardRef(
  (
    props: {
      projectEntity: string;
      userEntity: string;
      serverType: string;
      handleModalCloseFn: (respObj?: any) => void;
    },
    ref,
  ) => {
    const classes = useStyles();
    const api = useApi(feedbackApiRef);
    const [feedbackType, setFeedbackType] = useState('BUG');
    const [selectedTag, setSelectedTag] = useState(issueTags[0]);
    const app = useApi(configApiRef);
    const summaryLimit = app.getOptionalNumber('feedback.summaryLimit') ?? 240;

    const [summary, setSummary] = useState({
      value: '',
      error: false,
      errorMessage: 'Enter some summary',
    });
    const [description, setDescription] = useState({
      value: '',
      error: false,
      errorMessage: 'Enter some description',
    });

    const projectEntity = props.projectEntity;
    const userEntity = props.userEntity;

    function handleCategoryClick(event: any) {
      setFeedbackType(event.target.value);
      setSelectedTag(
        event.target.value === 'FEEDBACK' ? feedbackTags[0] : issueTags[0],
      );
    }

    function handleChipSlection(tag: string) {
      if (tag === selectedTag) {
        return;
      }
      setSelectedTag(tag);
    }

    async function handleSubmitClick() {
      const resp = await api.createFeedback({
        summary: summary.value,
        description: description.value,
        projectId: projectEntity,
        url: window.location.href,
        userAgent: navigator.userAgent,
        createdBy: userEntity,
        feedbackType:
          feedbackType === 'BUG'
            ? FeedbackCategory.BUG
            : FeedbackCategory.FEEDBACK,
        tag: selectedTag,
      });
      props.handleModalCloseFn(resp);
    }

    function handleInputChange(
      event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) {
      if (event.target.id === 'summary') {
        const _summary = event.target.value;
        if (_summary.trim().length === 0) {
          return setSummary({
            ...summary,
            value: '',
            errorMessage: 'Provide summary',
            error: true,
          });
        } else if (_summary.length > summaryLimit) {
          return setSummary({
            ...summary,
            value: _summary,
            error: true,
            errorMessage: `Summary should be less than ${summaryLimit} characters.`,
          });
        }
        return setSummary({ ...summary, value: _summary, error: false });
      }
      if (event.target.id === 'description') {
        return setDescription({
          ...description,
          value: event.target.value,
          error: false,
        });
      }
      return 0;
    }

    function handleValidation(
      event: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>,
    ) {
      if (event.target.id === 'summary') {
        if (event.target.value.length === 0) {
          return setSummary({ ...summary, error: true });
        }
        return setSummary({
          ...summary,
          value: event.target.value.trim(),
          error: event.target.value.trim().length > summaryLimit,
        });
      }
      if (event.target.id === 'description' && event.target.value.length > 0) {
        setDescription({ ...description, value: description.value.trim() });
      }
      return 0;
    }

    return (
      <Paper innerRef={ref}>
        <DialogTitle>
          {`Feedback for ${projectEntity.split('/').pop()}`}
          {props.handleModalCloseFn ? (
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={props.handleModalCloseFn}
            >
              <CloseRounded />
            </IconButton>
          ) : null}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container justifyContent="flex-start" className={classes.root}>
            <Grid item xs={4}>
              <Typography variant="h6">Select type</Typography>
              <RadioGroup className={classes.radioGroup} row>
                <FormControlLabel
                  value="BUG"
                  checked={feedbackType === 'BUG'}
                  onChange={handleCategoryClick}
                  label="Bug"
                  control={
                    <Radio
                      icon={<BugReportOutlined />}
                      checkedIcon={<BugReportTwoToneIcon />}
                      color="secondary"
                    />
                  }
                />
                <FormControlLabel
                  value="FEEDBACK"
                  onChange={handleCategoryClick}
                  label="Feedback"
                  control={
                    <Radio
                      icon={<SmsOutlined />}
                      checkedIcon={<SmsTwoTone />}
                      color="primary"
                    />
                  }
                />
              </RadioGroup>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Select {feedbackType === 'FEEDBACK' ? 'Feedback' : 'Bug'}
                :&nbsp;
                {feedbackType === 'BUG'
                  ? issueTags.map(issueTitle => (
                      <Chip
                        key={issueTitle.toLowerCase()}
                        clickable
                        variant={
                          selectedTag === issueTitle ? 'default' : 'outlined'
                        }
                        color="secondary"
                        onClick={() => handleChipSlection(issueTitle)}
                        label={issueTitle}
                      />
                    ))
                  : feedbackTags.map(feedbackTitle => (
                      <Chip
                        key={feedbackTitle.toLowerCase()}
                        clickable
                        variant={
                          selectedTag === feedbackTitle ? 'default' : 'outlined'
                        }
                        color="primary"
                        onClick={() => handleChipSlection(feedbackTitle)}
                        label={feedbackTitle}
                      />
                    ))}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoComplete="off"
                id="summary"
                label="Summary"
                value={summary.value}
                variant="outlined"
                placeholder="Enter Summary"
                onChange={handleInputChange}
                onBlur={handleValidation}
                error={summary.error}
                helperText={
                  summary.error
                    ? summary.errorMessage
                    : `${summary.value.length}/${summaryLimit}`
                }
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                inputMode="text"
                autoComplete="off"
                id="description"
                label="Description"
                value={description.value}
                variant="outlined"
                placeholder="Enter description"
                multiline
                minRows={6}
                maxRows={10}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className={classes.actions}>
          <Button onClick={props.handleModalCloseFn}>Cancel</Button>
          <Button
            onClick={handleSubmitClick}
            color={feedbackType === 'FEEDBACK' ? 'primary' : 'secondary'}
            variant="contained"
            disabled={summary.error || summary.value.length === 0}
          >
            {feedbackType === 'FEEDBACK' ? 'Send Feedback' : 'Report Bug'}
          </Button>
        </DialogActions>
        {props.serverType.toLowerCase() !== 'mail' &&
        !selectedTag.match(/(Excellent|Good)/g) ? (
          <Alert severity="warning" variant="outlined">
            Note: By submitting&nbsp;
            {feedbackType === 'FEEDBACK' ? 'feedback' : 'bug'} with this tag, it
            will create an issue in {props.serverType.toLowerCase()}
          </Alert>
        ) : null}
      </Paper>
    );
  },
);
