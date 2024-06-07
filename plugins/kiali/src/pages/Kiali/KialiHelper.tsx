import React from 'react';

import {
  CodeSnippet,
  InfoCard,
  Link,
  WarningPanel,
} from '@backstage/core-components';

import HelpRounded from '@material-ui/icons/HelpRounded';

import { KialiChecker } from '../../store/KialiProvider';

export const KialiHelper = (props: { check: KialiChecker }) => {
  const pretty = () => {
    if (props.check.message) {
      const helper = props.check.helper;
      const attributes =
        props.check.missingAttributes &&
        `Missing attributes: ${props.check.missingAttributes.join(',')}.`;
      return (
        <>
          <InfoCard>
            <CodeSnippet text={props.check.message} language="bash" />
          </InfoCard>
          {attributes && (
            <>
              <br /> {attributes}
            </>
          )}
          {helper && (
            <>
              <br /> <HelpRounded />
              {helper}
            </>
          )}
        </>
      );
    }
    return <></>;
  };

  const printAuthentication = (
    <>
      The authentication provided by Kiali is{' '}
      <b>{props.check.authData?.strategy}</b>. <br />
      You need to install the kiali backend to be able to use this kiali.
      <br /> Follow the steps in{' '}
      <Link to="https://github.com/janus-idp/backstage-plugins/blob/main/plugins/kiali-backend/README.md">
        Kiali Plugin
      </Link>
      {pretty()}
    </>
  );

  return props.check.verify ? (
    <></>
  ) : (
    <WarningPanel
      data-test={props.check.title || 'Unexpected Check'}
      title={props.check.title || 'Unexpected Check'}
    >
      {props.check.authData ? printAuthentication : pretty()}
    </WarningPanel>
  );
};
