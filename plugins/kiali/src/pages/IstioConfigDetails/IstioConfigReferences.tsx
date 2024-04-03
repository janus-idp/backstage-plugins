import React from 'react';

import { List, ListItem, Typography } from '@material-ui/core';

import { ReferenceIstioObjectLink } from '../../components/Link/IstioObjectLink';
import { ServiceLink } from '../../components/Link/ServiceLink';
import { WorkloadLink } from '../../components/Link/WorkloadLink';
import {
  ObjectReference,
  ServiceReference,
  WorkloadReference,
} from '../../types/IstioObjects';

interface IstioConfigReferencesProps {
  objectReferences: ObjectReference[];
  serviceReferences: ServiceReference[];
  workloadReferences: WorkloadReference[];
  isValid: boolean | undefined;
  cluster?: string;
}

export const IstioConfigReferences = (props: IstioConfigReferencesProps) => {
  const objectReferencesExists = (): boolean => {
    if (props.objectReferences && props.objectReferences.length > 0) {
      return true;
    }
    return false;
  };

  const serviceReferencesExists = (): boolean => {
    if (props.serviceReferences && props.serviceReferences.length > 0) {
      return true;
    }
    return false;
  };

  const workloadReferencesExists = (): boolean => {
    if (props.workloadReferences && props.workloadReferences.length > 0) {
      return true;
    }
    return false;
  };

  return (
    <>
      <Typography variant="h6" gutterBottom style={{ marginTop: 10 }}>
        References
      </Typography>

      {!objectReferencesExists() &&
        !serviceReferencesExists() &&
        !workloadReferencesExists() && (
          <>No references found for this object.</>
        )}

      {serviceReferencesExists() &&
        props.serviceReferences.map((reference, sRef) => {
          return (
            <List style={{ padding: 0 }}>
              <ListItem key={sRef} style={{ padding: 0 }}>
                <ServiceLink
                  name={reference.name}
                  namespace={reference.namespace}
                  cluster={props.cluster}
                />
              </ListItem>
            </List>
          );
        })}

      {workloadReferencesExists() &&
        props.workloadReferences.map((reference, wRef) => {
          return (
            <List style={{ padding: 0 }}>
              <ListItem key={wRef} style={{ padding: 0 }}>
                <WorkloadLink
                  name={reference.name}
                  namespace={reference.namespace}
                  cluster={props.cluster}
                />
              </ListItem>
            </List>
          );
        })}

      {objectReferencesExists() &&
        props.objectReferences.map((reference, oRef) => {
          return (
            <List style={{ padding: 0 }}>
              <ListItem key={oRef} style={{ padding: 0 }}>
                <ReferenceIstioObjectLink
                  name={reference.name}
                  namespace={reference.namespace}
                  type={reference.objectType}
                  cluster={props.cluster}
                />
              </ListItem>
            </List>
          );
        })}
    </>
  );
};
