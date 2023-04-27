import { useEntity } from '@backstage/plugin-catalog-react';
import { useKubernetesObjects } from '@backstage/plugin-kubernetes';

export const useImageStreamFromCluster = (cluster, image) => {
  const { entity } = useEntity();

  const { kubernetesObjects, loading, error } = useKubernetesObjects(entity);

  const data = kubernetesObjects?.items.filter(o => o.cluster.name === cluster).flatMap(o => o.resources)

  console.log(data);

  return { data, loading, error };
};
