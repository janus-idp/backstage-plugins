export interface TagsResponse {
  page: number;
  has_additional: boolean;
  tags: Tag[];
}

export interface Tag {
  name: string;
  is_manifest_list: boolean;
  last_modified: string;
  manifest_digest: string;
  reversion: boolean;
  size: number;
  start_ts: number;
  manifest_list: ManifestList;
  expiration?: string;
}

export interface ManifestList {
  schemaVersion: number;
  mediaType: string;
  manifests: Manifest[];
}

export interface Manifest {
  mediaType: string;
  size: number;
  digest: string;
  platform: Platform;
  security: SecurityDetailsResponse;
  layers: Layer[];
}

export interface Layer {
  size: number;
}

export interface Platform {
  architecture: string;
  os: string;
  features?: string[];
  variant?: string;
  'os.version'?: string;
}

export interface LabelsResponse {
  labels: Label[];
}

export interface Label {
  id: string;
  key: string;
  media_type: string;
  source_type: string;
  value: string;
}
export interface ManifestByDigestResponse {
  digest: string;
  is_manifest_list: boolean;
  manifest_data: string;
  config_media_type?: any;
  layers?: any;
}

export interface SecurityDetailsResponse {
  status: string;
  data: Data;
}
export interface Data {
  Layer: Layer;
}
export interface Layer {
  Name: string;
  ParentName: string;
  NamespaceName: string;
  IndexedByVersion: number;
  Features: Feature[];
}
export interface Feature {
  Name: string;
  VersionFormat: string;
  NamespaceName: string;
  AddedBy: string;
  Version: string;
  Vulnerabilities?: Vulnerability[];
}

export interface Vulnerability {
  Severity: VulnerabilitySeverity;
  NamespaceName: string;
  Link: string;
  FixedBy: string;
  Description: string;
  Name: string;
  Metadata: VulnerabilityMetadata;
}

export interface VulnerabilityMetadata {
  UpdatedBy: string;
  RepoName: string;
  RepoLink: string;
  DistroName: string;
  DistroVersion: string;
  NVD: {
    CVSSv3: {
      Vectors: string;
      Score: number;
    };
  };
}

export enum VulnerabilitySeverity {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Negligible = 'Negligible',
  None = 'None',
  Unknown = 'Unknown',
}

export const VulnerabilityOrder = {
  [VulnerabilitySeverity.Critical]: 0,
  [VulnerabilitySeverity.High]: 1,
  [VulnerabilitySeverity.Medium]: 2,
  [VulnerabilitySeverity.Low]: 3,
  [VulnerabilitySeverity.Negligible]: 4,
  [VulnerabilitySeverity.Unknown]: 5,
};

// Make the `request` function generic
// to specify the return data type:
function request<TResponse>(
    url: string,
    // `RequestInit` is a type for configuring 
    // a `fetch` request. By default, an empty object.
    config: RequestInit = {}
     
  // This function is async, it will return a Promise:
  ): Promise<TResponse> {
      
    // Inside, we call the `fetch` function with 
    // a URL and config given:
    return fetch(url, config)
      // When got a response call a `json` method on it
      .then((response) => response.json())
      // and return the result data.
      .then((data) => data as TResponse);
      
      // We also can use some post-response
      // data-transformations in the last `then` clause.
  }

export async function getTags(
  baseUrl: string,
  //username: string,
  token: string,
  //password: string,
  org: string,
  repo: string,
  page: number,
  limit = 100,
  specificTag = null,
) {
  let path = `${baseUrl}/api/v1/repository/${org}/${repo}/tag/?limit=${limit}&page=${page}&onlyActiveTags=true`;
  if (specificTag) {
    path = path.concat(`&specificTag=${specificTag}`);
  }
  const tags = await request<TagsResponse>(path,{
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return tags;
}

export async function getLabels(
    baseUrl: string,
    token: string,
    org: string,
    repo: string,
    digest: string) {
  const labels = await request<LabelsResponse>(
    `${baseUrl}/api/v1/repository/${org}/${repo}/manifest/${digest}/labels`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
  );
  return labels;
}

export async function getManifestByDigest(
  baseUrl: string,
  token: string,
  org: string,
  repo: string,
  digest: string,
) {
  const manifestByDigestResponse = await request<ManifestByDigestResponse>(
    `${baseUrl}/api/v1/repository/${org}/${repo}/manifest/${digest}`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
  );
  return manifestByDigestResponse;
}

export async function getSecurityDetails(
  baseUrl: string,
  token: string,
  org: string,
  repo: string,
  digest: string,
) {
  const securityDetailsResponse = await request<SecurityDetailsResponse>(
    `${baseUrl}/api/v1/repository/${org}/${repo}/manifest/${digest}/security?vulnerabilities=true`,{
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
  );
  return securityDetailsResponse;
}