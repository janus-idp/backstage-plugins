import React from 'react';

import {
  Content,
  MissingAnnotationEmptyState,
  Page,
} from '@backstage/core-components';

import { ANNOTATION_SUPPORTED } from '../../components/Router';

export const KialiNoAnnotation = () => {
  return (
    <Page themeId="tool">
      <Content>
        <MissingAnnotationEmptyState
          annotation={ANNOTATION_SUPPORTED}
          readMoreUrl="https://github.com/janus-idp/backstage-plugins/blob/main/plugins/kiali/README.md"
        />
      </Content>
    </Page>
  );
};
