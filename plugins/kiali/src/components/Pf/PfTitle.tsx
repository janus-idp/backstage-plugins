// @ts-nocheck
import * as React from 'react';

import {
  ApplicationsIcon,
  BundleIcon,
  ServiceIcon,
} from '@patternfly/react-icons';

import { kialiStyle } from '../../styles/StyleUtils';
import { MissingSidecar } from '../MissingSidecar/MissingSidecar';

const PfTitleStyle = kialiStyle({
  fontSize: '19px',
  fontWeight: 400,
  margin: '20px 0',
  padding: '0',
});

interface PfTitleProps {
  location?: {
    pathname: string;
    search: string;
  };
  istio?: boolean;
}

const namespaceRegex =
  /namespaces\/([a-z0-9-]+)\/([a-z0-9-]+)\/([a-z0-9-]+)(\/([a-z0-9-]+))?(\/([a-z0-9-]+))?/;

export const PfTitle = (props: PfTitleProps) => {
  const [type, setType] = React.useState<string>('');
  const [namespace, setNamespace] = React.useState<string>('');
  const [name, setName] = React.useState<string>('');
  const [graphType, setGraphType] = React.useState<string>('');
  const [icon, setIcon] = React.useState<JSX.Element>(<></>);

  const doRefresh = () => {
    let typeP = '';
    if (props.location) {
      const match = props.location.pathname.match(namespaceRegex) || [];
      setNamespace(match[1]);
      typeP = match[2];
      setType(typeP);
      setName(match[3]);
    }
    switch (typeP) {
      case 'services':
        setGraphType('service');
        setIcon(<ServiceIcon />);
        break;
      case 'workloads':
        setGraphType('workload');
        setIcon(<BundleIcon />);
        break;
      case 'applications':
        setGraphType('app');
        setIcon(<ApplicationsIcon />);
        break;
      default:
    }
  };

  React.useEffect(() => {
    doRefresh();
    // eslint-disable-next-line
  }, []);

  return (
    <h2 className={PfTitleStyle}>
      {icon} {name}
      {name && props.istio !== undefined && !props.istio && (
        <span style={{ marginLeft: '10px' }}>
          <MissingSidecar namespace={namespace} />
        </span>
      )}
    </h2>
  );
};
