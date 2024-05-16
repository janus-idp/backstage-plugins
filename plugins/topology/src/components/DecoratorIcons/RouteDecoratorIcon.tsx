import * as React from 'react';

import {
  BitbucketIcon,
  GitAltIcon,
  GithubIcon,
  GitlabIcon,
} from '@patternfly/react-icons';

import { detectGitType, GitProvider } from '../../utils/git-utils';
import CheIcon from './CheIcon';

type RouteDecoratorIconProps = {
  routeURL: string;
  radius: number;
  cheEnabled?: boolean;
};

const RouteDecoratorIcon = ({
  routeURL,
  radius,
  cheEnabled,
}: RouteDecoratorIconProps) => {
  if (cheEnabled && routeURL) {
    return <CheIcon style={{ fontSize: radius }} />;
  }
  switch (detectGitType(routeURL)) {
    case GitProvider.INVALID:
      // Not a valid url and thus not safe to use
      return null;
    case GitProvider.GITHUB:
      return (
        <GithubIcon style={{ fontSize: radius }} title="Edit source code" />
      );
    case GitProvider.BITBUCKET:
      return (
        <BitbucketIcon style={{ fontSize: radius }} title="Edit source code" />
      );
    case GitProvider.GITLAB:
      return (
        <GitlabIcon style={{ fontSize: radius }} title="Edit source code" />
      );
    default:
      return (
        <GitAltIcon style={{ fontSize: radius }} title="Edit source code" />
      );
  }
};

export default RouteDecoratorIcon;
