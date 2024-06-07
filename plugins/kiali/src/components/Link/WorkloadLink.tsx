import * as React from 'react';

import { JanusObjectLink } from '../../utils/janusLinks';
import { PFBadge, PFBadges } from '../Pf/PfBadges';

type WorkloadLinkProps = {
  cluster?: string;
  name: string;
  namespace: string;
  query?: string;
};

export const WorkloadLink = (props: WorkloadLinkProps) => {
  const { name, namespace, cluster, query } = props;

  return (
    <>
      <PFBadge badge={PFBadges.Workload} />
      <JanusObjectLink
        name={name}
        type="workloads"
        namespace={namespace}
        cluster={cluster}
        query={query}
      />
    </>
  );
};
