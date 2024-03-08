import React from 'react';

import { List, ListItem, Tooltip, Typography } from '@material-ui/core';

import { Validation } from '../../components/Validations/Validation';
import { KialiIcon } from '../../config/KialiIcon';
import { kialiStyle } from '../../styles/StyleUtils';
import {
  IstioLevelToSeverity,
  ObjectCheck,
  ValidationMessage,
  ValidationTypes,
} from '../../types/IstioObjects';

interface Props {
  messages?: ValidationMessage[];
  checks?: ObjectCheck[];
}

const infoStyle = kialiStyle({
  marginLeft: '0.5rem',
  verticalAlign: '-0.06em !important',
});

export const IstioStatusMessageList = (props: Props) => {
  return (
    <>
      <Typography variant="h6" gutterBottom style={{ marginTop: 10 }}>
        Configuration Analysis
      </Typography>
      <List style={{ padding: 0 }}>
        {(props.messages || []).map((msg: ValidationMessage, i: number) => {
          const severity: ValidationTypes =
            IstioLevelToSeverity[
              (msg.level as keyof typeof IstioLevelToSeverity) || 'UNKNOWN'
            ];
          return (
            <ListItem style={{ padding: 0 }} key={i}>
              <Validation severity={severity} />
              <a
                href={msg.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {msg.type.code}
              </a>
              {msg.description ? `: ${msg.description}` : undefined}
            </ListItem>
          );
        })}
      </List>
      <List style={{ padding: 0 }}>
        {(props.checks || []).map((check: ObjectCheck, i: number) => {
          const severity: ValidationTypes =
            IstioLevelToSeverity[
              (check.severity.toUpperCase() as keyof typeof IstioLevelToSeverity) ||
                'UNKNOWN'
            ];
          return (
            <ListItem style={{ padding: 0 }} key={i}>
              <Validation severity={severity} />
              {check.code}
              <Tooltip title={check.message}>
                <span className="iconInfo">
                  <KialiIcon.Info className={infoStyle} />
                </span>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </>
  );
};
