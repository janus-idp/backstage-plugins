import * as React from 'react';

import { PFBadge, PFBadges } from '../../components/Pf/PfBadges';
import { JanusObjectLink } from '../../utils/janusLinks';

type ServiceLinkProps = {
  cluster?: string;
  name: string;
  namespace: string;
  query?: string;
};

export const ServiceLink = (props: ServiceLinkProps) => {
  const { name, namespace, cluster, query } = props;

  return (
    <>
      <PFBadge badge={PFBadges.Service} />
      <JanusObjectLink
        name={name}
        type="services"
        namespace={namespace}
        cluster={cluster}
        query={query}
      />
    </>
  );
};
