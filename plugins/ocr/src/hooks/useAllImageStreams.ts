import { useEntity } from "@backstage/plugin-catalog-react"
import { useKubernetesObjects } from '@backstage/plugin-kubernetes';

export const useAllImageStreams = () => {
  const { entity } = useEntity();

  const { kubernetesObjects, loading, error } = useKubernetesObjects(entity);

  return { kubernetesObjects, loading, error };
}
