import { CodeSnippet } from '@backstage/core-components';
import { V1Ingress } from '@kubernetes/client-node';
import jsYaml from 'js-yaml';
import * as React from 'react';

type IngressRulesProps = { ingress: V1Ingress };

const IngressRules = ({ ingress }: IngressRulesProps) => {
  return <CodeSnippet text={jsYaml.dump(ingress.spec)} language="yaml" />;
};

export default IngressRules;
