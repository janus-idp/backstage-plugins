import React from 'react';

import { Entity } from '@backstage/catalog-model';
import {
  CodeSnippet,
  Content,
  EmptyState,
  Page,
} from '@backstage/core-components';

import { Box } from '@material-ui/core';

import { ANNOTATION_SUPPORTED } from '../../components/Router';

export const KialiNoResources = (props: { entity: Entity }) => {
  const annotationsKey = Object.keys(
    props.entity.metadata.annotations || [],
  ).filter(key => ANNOTATION_SUPPORTED.indexOf(key) > -1);
  return (
    <Page themeId="tool">
      <Content>
        <EmptyState
          missing="data"
          title="No resources to show with these annotations"
          description={
            <>
              Kiali detected the annotations:
              <ul style={{ marginTop: '5px' }}>
                {annotationsKey.map(key => (
                  <li>
                    <b>{key}</b>:{' '}
                    {props.entity.metadata.annotations
                      ? props.entity.metadata.annotations[key]
                      : 'Not found'}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '40px' }}>
                This is the entity loaded.
                <Box style={{ marginTop: '10px' }}>
                  <CodeSnippet
                    text={JSON.stringify(props.entity, null, 2)}
                    language="yaml"
                    showLineNumbers
                    customStyle={{ background: 'inherit', fontSize: '115%' }}
                  />
                </Box>
              </div>
            </>
          }
        />
      </Content>
    </Page>
  );
};
