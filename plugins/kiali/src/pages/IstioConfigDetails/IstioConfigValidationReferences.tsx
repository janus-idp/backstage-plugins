import React from 'react';

import { List, ListItem, Typography } from '@material-ui/core';

import { ReferenceIstioObjectLink } from '../../components/Link/IstioObjectLink';
import { ObjectReference } from '../../types/IstioObjects';

interface IstioConfigReferencesProps {
  objectReferences: ObjectReference[];
  cluster?: string;
}

export const IstioConfigValidationReferences = (
  props: IstioConfigReferencesProps,
) => {
  return (
    <>
      <Typography variant="h6" gutterBottom style={{ marginTop: 10 }}>
        Validation References
      </Typography>
      <List style={{ padding: 0 }}>
        {props.objectReferences &&
          props.objectReferences.map((reference, i) => {
            return (
              <ListItem style={{ padding: 0 }} key={i}>
                <ReferenceIstioObjectLink
                  name={reference.name}
                  namespace={reference.namespace}
                  cluster={props.cluster}
                  type={reference.objectType}
                />
              </ListItem>
            );
          })}
      </List>
    </>
  );
};
