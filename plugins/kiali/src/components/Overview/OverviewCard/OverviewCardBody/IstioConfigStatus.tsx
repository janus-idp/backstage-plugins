import React from 'react';

import { Link } from '@backstage/core-components';

import { Tooltip } from '@material-ui/core';

import {
  NamespaceInfo,
  ValidationStatus,
  ValidationTypes,
} from '@janus-idp/backstage-plugin-kiali-common';

import {
  createIcon,
  ErrorIcon,
  InfoIcon,
  OkIcon,
  WarningIcon,
} from '../../../Icons';

declare const directionTypes: {
  inbound: string;
  outbound: string;
};
export type DirectionType = keyof typeof directionTypes;

type IstioConfigStatusProps = {
  ns: NamespaceInfo;
  kialiConsole: string;
};

const getIcon = (severity: ValidationTypes, props?: any) => {
  switch (severity) {
    case ValidationTypes.Error:
      return createIcon(ErrorIcon, props);
    case ValidationTypes.Warning:
      return createIcon(WarningIcon, props);
    case ValidationTypes.Info:
      return createIcon(InfoIcon, props);
    default:
      return createIcon(OkIcon, props);
  }
};

const getTypeMessage = (count: number, type: ValidationTypes): string => {
  return count > 1 ? `${count} ${type}s found` : `${count} ${type} found`;
};

const severitySummary = (warnings: number, errors: number) => {
  const issuesMessages: string[] = [];

  if (errors > 0) {
    issuesMessages.push(getTypeMessage(errors, ValidationTypes.Error));
  }

  if (warnings > 0) {
    issuesMessages.push(getTypeMessage(warnings, ValidationTypes.Warning));
  }

  if (issuesMessages.length === 0) {
    issuesMessages.push('No issues found');
  }

  return issuesMessages;
};

const tooltipContent = (validations: ValidationStatus) => {
  if (validations.objectCount) {
    if (validations.objectCount === 0) {
      return <>No Istio config objects found</>;
    }

    return (
      <>
        Istio config objects analyzed: {validations.objectCount}
        <br />
        <ul style={{ listStyle: 'none' }}>
          {severitySummary(validations.warnings, validations.errors).map(
            cat => (
              <li key={cat}>{cat}</li>
            ),
          )}
        </ul>
      </>
    );
  }
  return <>No Istio config validation available</>;
};

export const IstioConfigStatus = (props: IstioConfigStatusProps) => {
  let validations: ValidationStatus = {
    objectCount: 0,
    errors: 0,
    warnings: 0,
  };
  let validationP = '';
  let severity = ValidationTypes.Correct;
  if (props.ns.validations) {
    validations = props.ns.validations;
    if (validations.warnings) {
      validationP += 'configvalidation=Warning';
    }
    if (validationP !== '') {
      validationP += '&';
    }
    if (validations.errors) {
      validationP += 'configvalidation=Not+Valid';
    }
    if (validations.errors > 0) {
      severity = ValidationTypes.Error;
    } else if (validations.warnings > 0) {
      severity = ValidationTypes.Warning;
    }
  }
  const namespaces = `namespaces=${props.ns.name}`;
  const linkIstioValidations = `${
    new URL('/console/istio', props.kialiConsole).href
  }?${namespaces}&${validationP}`;

  return validations.objectCount && validations.objectCount > 0 ? (
    <Link to={linkIstioValidations}>
      <Tooltip title={tooltipContent(validations)} placement="right">
        {validations.objectCount > 0 ? (
          getIcon(severity, { fontSize: 'inherit' })
        ) : (
          <div style={{ display: 'inline-block', marginLeft: '5px' }}>N/A</div>
        )}
      </Tooltip>
    </Link>
  ) : (
    <div style={{ display: 'inline-block', marginLeft: '5px' }}>N/A</div>
  );
};
