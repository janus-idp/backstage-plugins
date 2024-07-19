import { CatalogApi, ValidateEntityResponse } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';

import { Logger } from 'winston';

import {
  CatalogInfoEntities,
  CatalogInfoGeneratorOptions,
  ValidatedEntity,
} from '../types';

export class CatalogInfoGenerator {
  private readonly logger: Logger;
  private readonly catalogApi: CatalogApi;

  constructor(logger: Logger, catalogApi: CatalogApi) {
    this.logger = logger;
    this.catalogApi = catalogApi;
  }

  /**
   * Validates a catalogInfo object
   * Checks for name collisions and will try to generate a unique name until it no longer causes a name collision on a best effort basis
   * Returns a ValidateEntityResponse object to indicate if the entity is valid
   * Returns the newly generated name (or the original name if no conflicts occur) of the entity to be used in the catalog-info.yaml generation
   */
  async validateCatalogInfo(
    catalogInfo: Entity,
    catalogInfoLocation: string,
    backstageToken?: string,
    fixName: boolean = false,
  ): Promise<ValidateEntityResponse & { name: string }> {
    if (!catalogInfo.metadata.name) {
      throw new Error('The catalog entity must have a metadata.name field');
    }
    let retryCount = 0;
    let name = catalogInfo.metadata.name;
    const namespace = catalogInfo.metadata.namespace || 'default';
    const kind = catalogInfo.kind;

    let entityRef = [`${kind}/${namespace}:${name}`];
    const filters = ['kind', 'metadata'];

    let resultantEntity = await this.catalogApi.getEntitiesByRefs(
      { entityRefs: entityRef, fields: filters },
      { token: backstageToken },
    );

    // Empty response returns {items: [undefined]} which indicates no entity exists in the catalog to conflict with this entity
    // Try to fix the name if there is a conflict and the fixName flag is set
    while (!resultantEntity.items?.includes(undefined) && fixName) {
      // Append a `-{number}` to prevent `metadata.name` collisions as they must be unique for the namespace
      name = `${name}-${++retryCount}`;
      entityRef = [`${kind}/${namespace}:${name}`];

      resultantEntity = await this.catalogApi.getEntitiesByRefs(
        { entityRefs: entityRef, fields: filters },
        { token: backstageToken },
      );
    }

    catalogInfo.metadata.name = name;

    let validateResult = await this.catalogApi.validateEntity(
      catalogInfo,
      `url:${catalogInfoLocation}`,
      { token: backstageToken },
    );

    // If there is a name conflict that was not fixed, add an error to the validation result
    if (!resultantEntity.items?.includes(undefined) && !fixName) {
      const nameConflictError = {
        name: 'NameConflictError',
        message: `The entity name ${name} already exists in the catalog. Please provide a unique name for the entity.`,
      };
      if (validateResult.valid) {
        validateResult = {
          valid: false,
          errors: [nameConflictError],
        };
      } else {
        validateResult.errors = [nameConflictError, ...validateResult.errors];
      }
    }
    return {
      ...validateResult,
      name,
    };
  }

  /**
   * Sanitizes the input string to follow the rules for entity names and namespaces
   * - Must be at least 1 character long and at most 63 characters long
   * - Must start and end with an alphanumeric character (a-z, 0-9, A-Z).
   * - Can contain dashes (-), underscores (_), dots (.), and alphanumerics in between.
   * If input string is empty, then set it to `default-entity`
   */
  sanitizeEntityInput(input: string): string {
    let output = input.substring(0, 63);
    output = output.replace(/[^a-z0-9\-_.]/gi, '-');
    const regex = new RegExp(/[a-z0-9].*[a-z0-9]/, 'i');
    const trimmedOutput = regex.exec(output);
    output = trimmedOutput ? trimmedOutput[0] : '';

    if (output.length === 0) {
      output = 'default-entity';
    }

    return output;
  }

  async createCatalogInfoGenerator(
    options: CatalogInfoGeneratorOptions,
  ): Promise<CatalogInfoEntities> {
    // The name of the entity is the name of the repository by default
    // TODO: add proper customizability outside of metadata, currently just a dummy prototype to test defaults
    let metadataName = options.metadata?.name || options.repoInfo.name;
    let metadataNamespace = options.metadata?.namespace;
    const title = options.metadata?.title || metadataName;

    metadataName = this.sanitizeEntityInput(metadataName);
    if (metadataNamespace) {
      metadataNamespace = this.sanitizeEntityInput(metadataNamespace);
    }

    let entity: ValidatedEntity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        // Default to the repository name if no name is provided
        name: metadataName,
        namespace: metadataNamespace,
        title: title,
        links: [
          {
            url: options.repoInfo.html_url,
            title: 'Repository Link',
          },
        ],
      },
      spec: {
        type: 'unknown',
        lifecycle: 'unknown',
        owner: 'unknown',
      },
    };

    const currentDate = this.sanitizeEntityInput(new Date().toISOString());
    // Place in root directory of the default branch
    const catalogInfoLocation = `${options.repoInfo.html_url}/blob/${options.repoInfo.default_branch}/catalog-info.yaml`;
    let locationEntity: ValidatedEntity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Location',
      metadata: {
        name: metadataName,
        namespace: metadataNamespace,
        labels: {
          'bulk-import/uuid': `${options.bulkImportUUID}`,
          'bulk-import/date-created': `${currentDate}`,
        },
      },
      spec: {
        target: `${catalogInfoLocation}`,
      },
    };

    const entityValidationResult = await this.validateCatalogInfo(
      entity,
      catalogInfoLocation,
      options.backstageToken,
      true,
    );
    if (entityValidationResult.valid) {
      // Updated name (if it was changed to avoid conflicts in the catalog)
      entity.metadata.name = entityValidationResult.name;
    } else {
      entity = entityValidationResult.errors;
    }

    const locationValidationResult = await this.validateCatalogInfo(
      locationEntity,
      catalogInfoLocation,
      options.backstageToken,
      true,
    );
    if (locationValidationResult.valid) {
      // Updated name (if it was changed to avoid conflicts in the catalog)
      locationEntity.metadata.name = locationValidationResult.name;
    } else {
      locationEntity = locationValidationResult.errors;
    }

    return {
      entity,
      locationEntity,
    };
  }
}
