export type ImageStream = {
  uid: string;
  name: string;
  namespace: string;
  last_modified: string;
  tags: string[];
  dockerImageRepo: string;
};

export type ImageStreamMetadata = ImageStream & {
  description?: string;
  version?: string;
  size?: string;
};
