import { SearchService } from './generated';

export type { AssetXO, ComponentXO } from './generated';

export type SearchServiceQuery = Parameters<typeof SearchService.search>[0];

export type Annotation = {
  annotation: string;
  query?: (str: string) => SearchServiceQuery;
};

export type RawAsset = {
  schemaVersion: number;
  mediaType: string;
  config: Config;
  layers: Layer[];
};

export type Config = {
  mediaType: string;
  size: number;
  digest: string;
};

export type Layer = {
  mediaType: string;
  size: number;
  digest: string;
};
