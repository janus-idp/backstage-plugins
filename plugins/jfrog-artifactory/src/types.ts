export interface TagsResponse {
  data: Data;
}

export interface Data {
  versions: Versions;
}

export interface Versions {
  edges: Edge[];
}

export interface Edge {
  node: Node;
}

export interface Node {
  name: string;
  created: Date;
  modified: Date;
  package: Package;
  repos: Repo[];
  licenses: any[];
  size: string;
  stats: Stats;
  vulnerabilities: Vulnerabilities | null;
  files: File[];
}

export interface File {
  name: string;
  lead: boolean;
  size: string;
  md5: string;
  sha1: string;
  sha256: string;
  mimeType: null | string;
}

export interface Package {
  id: string;
}

export interface Repo {
  name: string;
  type: string;
  leadFilePath: string;
}

export interface Stats {
  downloadCount: number;
}

export interface Vulnerabilities {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  unknown: number;
  skipped: number;
}
