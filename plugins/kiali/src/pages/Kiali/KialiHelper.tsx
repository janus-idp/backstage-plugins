import React from 'react';

import {
  CodeSnippet,
  Content,
  InfoCard,
  Link,
  Page,
  WarningPanel,
} from '@backstage/core-components';

import HelpRounded from '@material-ui/icons/HelpRounded';

import { KialiChecker } from '../../store/KialiProvider';
import { Chip } from '@material-ui/core';

export const KialiHelper = (props: { check: KialiChecker }) => {
  const pretty = () => {
    if (props.check.message) {
      const helper = props.check.helper;
      const attributes =
        props.check.missingAttributes &&
        (<><b>Missing attributes:</b> {props.check.missingAttributes.join(',')}.</>);
      return (
        <>
          <br />
          <br />
          <InfoCard>
            <CodeSnippet text={props.check.message} language="bash" />
          </InfoCard>
          {attributes && (
            <>
              <br /> {attributes}
            </>
          )}
          {helper && (
            <div style={{marginTop: '15px'}}>
              <Chip icon={<HelpRounded />} label={helper} />
            </div>
          )}
        </>
      );
    }
    return <></>;
  };

  const printAuthentication = (
    <>
      The authentication provided by Kiali is{' '}
      <b>{props.check.authData?.strategy || 'Unknown'}</b>. <br />
      You need to install the kiali backend to be able to use this kiali.
      <br /> Follow the steps in{' '}
      <Link to="https://github.com/janus-idp/backstage-plugins/blob/main/plugins/kiali-backend/README.md">
        Kiali Plugin
      </Link>
      {pretty()}
    </>
  );

  const getTitle = () => {
    if (!props.check.verify) {
      if (props.check.missingAttributes && props.check.missingAttributes.includes('url')) {
        return 'Kiali Plugin can reach the backend'
      } else {
        return 'Authentication failed.';
      }
    }

    return 'Unexpected Check';
  };
  return (
    <Page themeId="tool">
      <Content>
        <WarningPanel title={getTitle()}>{printAuthentication}</WarningPanel>
      </Content>
    </Page>
  );
};
