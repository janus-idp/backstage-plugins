export interface PackageResponse {
  data: Data;
}

export interface Data {
  packages: Packages;
}

export interface Packages {
  edges: PackageEdge[];
}

export interface PackageEdge {
  node: PackageNode;
}

export interface PackageNode {
  name: string;
  description: string | null;
  created: string;
  versions: Version[];
}

export interface Version {
  name: string;
  size: string;
  repos: Repo[];
  package: Package;
  vulnerabilities: Vulnerabilities;
  stats: Stats;
}

export interface Vulnerabilities {
  high?: number;
  medium?: number;
  low?: number;
  info?: number;
  unknown?: number;
  skipped?: number;
}

export interface Stats {
  downloadCount: number;
}

export interface Package {
  packageType: string;
}

export interface Repo {
  name: string;
}
