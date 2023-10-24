import {
  FetchUrlReader,
  PluginEndpointDiscovery,
  ReaderFactory,
  UrlReaders,
} from '@backstage/backend-common';
import { UrlReaderService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { isError } from '@backstage/errors';
import {
  isResourcePermission,
  Permission,
} from '@backstage/plugin-permission-common';
import {
  MetadataResponse,
  MetadataResponseSerializedRule,
} from '@backstage/plugin-permission-node';

import { Logger } from 'winston';

import { Policy } from '@janus-idp/backstage-plugin-rbac-common';

import { PluginIdProvider } from './policy-builder';

type PluginMetadataResponse = {
  pluginId: string;
  metaDataResponse: MetadataResponse;
};

export type PluginMetadataResponseSerializedRule = {
  pluginId: string;
  rules: MetadataResponseSerializedRule[];
};

export type PluginPermissionMetaData = {
  pluginId: string;
  policies: Policy[];
};

export class PluginPermissionMetadataCollector {
  private readonly pluginIds: string[];
  private urlReader: UrlReaderService;

  constructor(
    private readonly discovery: PluginEndpointDiscovery,
    private readonly pluginIdProvider: PluginIdProvider,
    config: Config,
    logger: Logger,
  ) {
    this.pluginIds = this.pluginIdProvider.getPluginIds();
    this.urlReader = UrlReaders.default({
      config,
      logger,
      factories: [PluginPermissionMetadataCollector.permissionFactory],
    });
  }

  async getPluginConditionRules(): Promise<
    PluginMetadataResponseSerializedRule[]
  > {
    const pluginMetadata = await this.getPluginMetaData();

    return pluginMetadata
      .filter(metadata => metadata.metaDataResponse.rules.length > 0)
      .map(metadata => {
        return {
          pluginId: metadata.pluginId,
          rules: metadata.metaDataResponse.rules,
        };
      });
  }

  async getPluginPolicies(): Promise<PluginPermissionMetaData[]> {
    const pluginMetadata = await this.getPluginMetaData();

    return pluginMetadata
      .filter(metadata => metadata.metaDataResponse.permissions !== undefined)
      .map(metadata => {
        return {
          pluginId: metadata.pluginId,
          policies: permissionsToCasbinPolicies(
            metadata.metaDataResponse.permissions!,
          ),
        };
      });
  }

  private static permissionFactory: ReaderFactory = () => {
    return [{ reader: new FetchUrlReader(), predicate: (_url: URL) => true }];
  };

  private async getPluginMetaData(): Promise<PluginMetadataResponse[]> {
    let pluginResponses: PluginMetadataResponse[] = [];

    for (const pluginId of this.pluginIds) {
      const baseEndpoint = await this.discovery.getBaseUrl(pluginId);
      const wellKnownURL = `${baseEndpoint}/.well-known/backstage/permissions/metadata`;
      try {
        const permResp = await this.urlReader.readUrl(wellKnownURL);
        const permMetaDataRaw = (await permResp.buffer()).toString();
        const permMetaData = JSON.parse(permMetaDataRaw);
        if (permMetaData) {
          pluginResponses = [
            ...pluginResponses,
            {
              metaDataResponse: permMetaData,
              pluginId,
            },
          ];
        }
      } catch (err) {
        if (!isError(err) || err.name !== 'NotFoundError') {
          throw err;
        }
      }
    }
    return pluginResponses;
  }
}

function permissionsToCasbinPolicies(permissions: Permission[]): Policy[] {
  return permissions.map(permission => {
    const policy: Policy = {
      permission: isResourcePermission(permission)
        ? permission.resourceType
        : permission.name,
      policy: permission.attributes.action || 'use',
    };
    return policy;
  });
}
