import {
  ClusterObjects,
  ObjectsByEntityResponse,
} from '@backstage/plugin-kubernetes-common';
import { ImageStreamGVK } from '../models';
import { ClusterErrors } from '../types';

export const getClusters = (k8sObjects: ObjectsByEntityResponse) => {
  const clusters: string[] = k8sObjects.items.map(
    (item: ClusterObjects) => item.cluster.name,
  );
  const errors: ClusterErrors[] = k8sObjects.items.map(
    (item: ClusterObjects) => item.errors,
  );
  return { clusters, errors };
};

const isImageStreamResource = (kind: string) => kind === ImageStreamGVK.kind;


type ImageStreamKind = Record<string, any>;


export const getImageStreamResources = (
  cluster: number,
  k8sObjects: ObjectsByEntityResponse,
) =>
  k8sObjects.items?.[cluster]?.resources?.reduce(
    (acc: ImageStreamKind[], resources) => {
      const customresources = resources.resources.filter(
        res => res.type === 'customresources',
      );
      return [
        ...acc,
        ...customresources.flatMap(res =>
          res.resources.filter((r: Record<string, any> & { kind: string}) => isImageStreamResource(r.kind)),
        ),
      ];
    },
    [],
  );

export const getImageStreamResourcesFromClusters = (
  k8sObjects: ObjectsByEntityResponse,
) =>
  k8sObjects.items?.reduce(
    (acc: ImageStreamKind[], cluster: ClusterObjects) => {
      const resources = cluster.resources.filter(
        res => res.type === 'customresources',
      );
      return [
        ...acc,
        ...resources.flatMap(res =>
          res.resources.filter(r => isImageStreamResource(r.kind)),
        ),
      ];
    }, []
  );
