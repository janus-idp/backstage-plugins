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
import { PluginIdProvider } from '@janus-idp/backstage-plugin-rbac-node';

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
    private readonly logger: Logger,
    config: Config,
  ) {
    this.pluginIds = this.pluginIdProvider.getPluginIds();
    this.urlReader = UrlReaders.default({
      config,
      logger,
      factories: [PluginPermissionMetadataCollector.permissionFactory],
    });
  }

  async getPluginConditionRules(
    token: string | undefined,
  ): Promise<PluginMetadataResponseSerializedRule[]> {
    const pluginMetadata = await this.getPluginMetaData(token);

    return pluginMetadata
      .filter(metadata => metadata.metaDataResponse.rules.length > 0)
      .map(metadata => {
        return {
          pluginId: metadata.pluginId,
          rules: metadata.metaDataResponse.rules,
        };
      });
  }

  async getPluginPolicies(
    token: string | undefined,
  ): Promise<PluginPermissionMetaData[]> {
    const pluginMetadata = await this.getPluginMetaData(token);

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

  private async getPluginMetaData(
    token: string | undefined,
  ): Promise<PluginMetadataResponse[]> {
    let pluginResponses: PluginMetadataResponse[] = [];

    for (const pluginId of this.pluginIds) {
      const permMetaData = await this.getMetadataByPluginId(pluginId, token);
      if (permMetaData) {
        pluginResponses = [
          ...pluginResponses,
          {
            metaDataResponse: permMetaData,
            pluginId,
          },
        ];
      }
    }

    return pluginResponses;
  }

  async getMetadataByPluginId(
    pluginId: string,
    token: string | undefined,
  ): Promise<MetadataResponse | undefined> {
    let permMetaData: MetadataResponse | undefined;
    try {
      const baseEndpoint = await this.discovery.getBaseUrl(pluginId);
      const wellKnownURL = `${baseEndpoint}/.well-known/backstage/permissions/metadata`;

      const permResp = await this.urlReader.readUrl(wellKnownURL, { token });
      const permMetaDataRaw = (await permResp.buffer()).toString();

      try {
        permMetaData = JSON.parse(permMetaDataRaw);
      } catch (err) {
        // workaround for https://issues.redhat.com/browse/RHIDP-1456
        return undefined;
      }
    } catch (err) {
      if (isError(err) && err.name === 'NotFoundError') {
        return undefined;
      }
      this.logger.error(
        `Failed to retrieve permission metadata for ${pluginId}. ${err}`,
      );
    }
    return permMetaData;
  }
}

function permissionsToCasbinPolicies(permissions: Permission[]): Policy[] {
  const policies = [];
  for (const permission of permissions) {
    if (isResourcePermission(permission)) {
      policies.push({
        permission: permission.resourceType,
        policy: permission.attributes.action || 'use',
      });
    }
    policies.push({
      permission: permission.name,
      policy: permission.attributes.action || 'use',
    });
  }
  return policies;
}
