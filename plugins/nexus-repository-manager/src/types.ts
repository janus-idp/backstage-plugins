import { SearchService } from './generated';

export type { AssetXO, ComponentXO } from './generated';

export type SearchServiceQuery = Parameters<typeof SearchService.search>[0];

export type Annotation = {
  annotation: string;
  query?: (str: string) => SearchServiceQuery;
};

export type RawAsset = RawAssetSchema1 | RawAssetSchema2;

/** @see {@link https://docs.docker.com/registry/spec/manifest-v2-1/|Image Manifest Version 2, Schema 1} */
export type RawAssetSchema1 = {
  schemaVersion: 1;
  name: string;
  tag: string;
  architecture: string;
  fsLayers: LayerSchema1[];
  history: HistorySchema1[];
};

export type LayerSchema1 = {
  blobSum: string;
};

export type HistorySchema1 = {
  v1Compatibility: string;
};

/** @see {@link https://docs.docker.com/registry/spec/manifest-v2-2/|Image Manifest Version 2, Schema 2} */
export type RawAssetSchema2 = {
  schemaVersion: 2;
  mediaType: 'application/vnd.docker.distribution.manifest.v2+json';
  config: ConfigSchema2;
  layers: LayerSchema2[];
};

export type ConfigSchema2 = {
  mediaType: string;
  size: number;
  digest: string;
};

export type LayerSchema2 = {
  mediaType: string;
  size: number;
  digest: string;
};
