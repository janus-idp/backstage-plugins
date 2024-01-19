import * as React from 'react';
import { CSSProperties } from 'react';

import { Tooltip, Typography } from '@material-ui/core';

import { kialiStyle } from '../../styles/StyleUtils';
import { StatusCondition, ValidationTypes } from '../../types/IstioObjects';
import { Validation } from './Validation';

interface Props {
  id: string;
  reconciledCondition?: StatusCondition;
  errors: number;
  warnings: number;
  objectCount?: number;
  style?: CSSProperties;
}

const tooltipListStyle = kialiStyle({
  textAlign: 'left',
  border: 0,
  padding: '0 0 0 0',
  margin: '0 0 0 0',
});

const tooltipSentenceStyle = kialiStyle({
  textAlign: 'center',
  border: 0,
  padding: '0 0 0 0',
  margin: '0 0 0 0',
});

export const ValidationSummary = (props: Props) => {
  const getTypeMessage = (count: number, type: ValidationTypes): string => {
    return count > 1 ? `${count} ${type}s found` : `${count} ${type} found`;
  };

  const severitySummary = () => {
    const issuesMessages: string[] = [];

    if (props.errors > 0) {
      issuesMessages.push(getTypeMessage(props.errors, ValidationTypes.Error));
    }

    if (props.warnings > 0) {
      issuesMessages.push(
        getTypeMessage(props.warnings, ValidationTypes.Warning),
      );
    }

    if (issuesMessages.length === 0) {
      issuesMessages.push('No issues found');
    }

    return issuesMessages;
  };

  const severity = () => {
    if (props.errors > 0) {
      return ValidationTypes.Error;
    } else if (props.warnings > 0) {
      return ValidationTypes.Warning;
    }
    return ValidationTypes.Correct;
  };

  const tooltipNA = () => {
    return (
      <Typography variant="body2" className={tooltipSentenceStyle}>
        No Istio config objects found
      </Typography>
    );
  };

  const tooltipNoValidationAvailable = () => {
    return (
      <Typography variant="body2" className={tooltipListStyle}>
        No Istio config validation available
      </Typography>
    );
  };

  const tooltipSummary = () => {
    return (
      <>
        <Typography
          variant="body2"
          style={{ textAlign: 'left', textEmphasis: 'strong' }}
        >
          Istio config objects analyzed: {props.objectCount}
        </Typography>
        <div className={tooltipListStyle}>
          {severitySummary().map(cat => (
            <div key={cat}>{cat}</div>
          ))}
        </div>
        {props.reconciledCondition?.status && (
          <Typography
            variant="body2"
            style={{ textAlign: 'left', textEmphasis: 'strong' }}
          >
            The object is reconciled
          </Typography>
        )}
      </>
    );
  };

  const tooltipContent = () => {
    if (props.objectCount !== undefined) {
      if (props.objectCount === 0) {
        return tooltipNA();
      }
      return tooltipSummary();
    }
    return tooltipNoValidationAvailable();
  };

  const tooltipBase = () => {
    return props.objectCount === undefined || props.objectCount > 0 ? (
      <Validation iconStyle={props.style} severity={severity()} />
    ) : (
      <div style={{ display: 'inline-block', marginLeft: '5px' }}>N/A</div>
    );
  };

  return (
    <Tooltip
      aria-label="Validations list"
      placement="right"
      title={tooltipContent()}
    >
      <span>{tooltipBase()}</span>
    </Tooltip>
  );
};
