import React from 'react';
import { CodeSnippet } from '@backstage/core-components';
import { V1Ingress } from '@kubernetes/client-node';
import jsYaml from 'js-yaml';

const IngressRules: React.FC<{ ingress: V1Ingress }> = ({ ingress }) => {
  return <CodeSnippet text={jsYaml.dump(ingress.spec)} language="yaml" />;
};

export default IngressRules;
