import { GroupVersionKind } from './types';


export const ImageStreamGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'image.openshift.io',
  kind: 'ImageStream',
};

export enum ModelsPlural {
  imagestreams = 'imagestreams',
}

export const ImageStreamMatcher = {
  ...ImageStreamGVK,
  group: ImageStreamGVK.apiGroup!,
  plural: ModelsPlural.imagestreams
}

export const ocrResourceModels: { [key: string]: GroupVersionKind } = {
  [ModelsPlural.imagestreams]: ImageStreamGVK,
};
