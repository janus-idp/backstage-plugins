export interface TagsResponse {
  imageName: string;
  registry: string;
  tags: Tag[]
}

export interface Tag {
  name: string;
  createdTime: Date;
  lastUpdateTime: Date;
  digest: string;
  signed: boolean;
  changeableAttributes: ChangeableAttributes;
}

export interface ChangeableAttributes {
  deleteEnabled: boolean;
  listEnabled: boolean;
  readEnabled: boolean;
  writeEnabled: boolean;
}