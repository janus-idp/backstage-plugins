// GENERATED FILE. DO NOT EDIT.

// eslint-disable
// prettier-ignore
import type {
  OpenAPIClient,
  Parameters,
  UnknownParamsObject,
  OperationResponse,
  AxiosRequestConfig,
} from 'openapi-client-axios';

declare namespace Components {
    namespace Schemas {
        export type ApprovalTool = "GIT" | "SERVICENOW";
        /**
         * Import Job
         */
        export interface Import {
            id?: string;
            status?: /* Import Job status */ ImportStatus;
            /**
             * Specified entity name in the catalog. Filled only in response for dry-run import requests.
             */
            catalogEntityName?: string;
            lastUpdate?: string; // date-time
            errors?: string[];
            approvalTool?: ApprovalTool;
            repository?: {
                /**
                 * repository name
                 */
                name?: string;
                /**
                 * repository URL
                 */
                url?: string;
                /**
                 * organization which the repository is part of
                 */
                organization?: string;
            };
            /**
             * GitHub details. Applicable if approvalTool is git.
             */
            github?: {
                pullRequest?: {
                    /**
                     * URL of the Pull Request
                     */
                    url?: string;
                    /**
                     * Pull Request number
                     */
                    number?: number;
                };
            };
        }
        /**
         * Import Job request
         */
        export interface ImportRequest {
            approvalTool?: ApprovalTool;
            /**
             * Expected Entity name in the catalog. Relevant only if the 'dryRun' query parameter is set to 'true'.
             */
            catalogEntityName?: string;
            repository: {
                /**
                 * repository name
                 */
                name?: string;
                /**
                 * repository URL
                 */
                url: string;
                /**
                 * organization which the repository is part of
                 */
                organization?: string;
                /**
                 * default branch
                 */
                defaultBranch?: string;
            };
            /**
             * content of the catalog-info.yaml to include in the import Pull Request.
             */
            catalogInfoContent?: string;
            /**
             * GitHub details. Applicable if approvalTool is git.
             */
            github?: {
                /**
                 * Pull Request details. Applicable if approvalTool is git.
                 */
                pullRequest?: {
                    /**
                     * title of the Pull Request
                     */
                    title?: string;
                    /**
                     * body of the Pull Request
                     */
                    body?: string;
                };
            };
        }
        /**
         * Import Job status
         */
        export type ImportStatus = "ADDED" | "WAIT_PR_APPROVAL" | "PR_ERROR" | null;
        /**
         * Organization
         */
        export interface Organization {
            /**
             * unique identifier
             */
            id?: string;
            /**
             * organization name
             */
            name?: string;
            /**
             * organization description
             */
            description?: string;
            /**
             * organization URL
             */
            url?: string;
            errors?: string[];
        }
        /**
         * Organization List
         */
        export interface OrganizationList {
            organizations?: /* Organization */ Organization[];
            errors?: string[];
            totalCount?: number;
            pagePerIntegration?: number;
            sizePerIntegration?: number;
        }
        /**
         * Repository
         */
        export interface Repository {
            /**
             * unique identifier
             */
            id?: string;
            /**
             * repository name
             */
            name?: string;
            /**
             * repository URL
             */
            url?: string;
            /**
             * organization which the repository is part of
             */
            organization?: string;
            importStatus?: /* Import Job status */ ImportStatus;
            /**
             * default branch
             */
            defaultBranch?: string;
            lastUpdate?: string; // date-time
            errors?: string[];
        }
        /**
         * Repository List
         */
        export interface RepositoryList {
            repositories?: /* Repository */ Repository[];
            errors?: string[];
            totalCount?: number;
            pagePerIntegration?: number;
            sizePerIntegration?: number;
        }
    }
}
declare namespace Paths {
    namespace CreateImportJobs {
        namespace Parameters {
            export type DryRun = boolean;
        }
        export interface QueryParameters {
            dryRun?: Parameters.DryRun;
        }
        export type RequestBody = /* Import Job request */ Components.Schemas.ImportRequest[];
        namespace Responses {
            export type $202 = /* Import Job */ Components.Schemas.Import[];
        }
    }
    namespace DeleteImportByRepo {
        namespace Parameters {
            export type DefaultBranch = string;
            export type Repo = string;
        }
        export interface QueryParameters {
            repo?: Parameters.Repo;
            defaultBranch?: Parameters.DefaultBranch;
        }
        namespace Responses {
            export interface $204 {
            }
            export interface $500 {
            }
        }
    }
    namespace FindAllImports {
        namespace Parameters {
            export type PagePerIntegration = number;
            export type SizePerIntegration = number;
        }
        export interface QueryParameters {
            pagePerIntegration?: Parameters.PagePerIntegration;
            sizePerIntegration?: Parameters.SizePerIntegration;
        }
        namespace Responses {
            export type $200 = /* Import Job */ Components.Schemas.Import[];
            export interface $500 {
            }
        }
    }
    namespace FindAllOrganizations {
        namespace Parameters {
            export type PagePerIntegration = number;
            export type SizePerIntegration = number;
        }
        export interface QueryParameters {
            pagePerIntegration?: Parameters.PagePerIntegration;
            sizePerIntegration?: Parameters.SizePerIntegration;
        }
        namespace Responses {
            export type $200 = /* Organization List */ Components.Schemas.OrganizationList;
            export type $500 = /* Organization List */ Components.Schemas.OrganizationList;
        }
    }
    namespace FindAllRepositories {
        namespace Parameters {
            export type CheckImportStatus = boolean;
            export type PagePerIntegration = number;
            export type SizePerIntegration = number;
        }
        export interface QueryParameters {
            checkImportStatus?: Parameters.CheckImportStatus;
            pagePerIntegration?: Parameters.PagePerIntegration;
            sizePerIntegration?: Parameters.SizePerIntegration;
        }
        namespace Responses {
            export type $200 = /* Repository List */ Components.Schemas.RepositoryList;
            export type $500 = /* Repository List */ Components.Schemas.RepositoryList;
        }
    }
    namespace FindImportStatusByRepo {
        namespace Parameters {
            export type DefaultBranch = string;
            export type Repo = string;
        }
        export interface QueryParameters {
            repo?: Parameters.Repo;
            defaultBranch?: Parameters.DefaultBranch;
        }
        namespace Responses {
            export type $200 = /* Import Job */ Components.Schemas.Import;
            export interface $500 {
            }
        }
    }
    namespace Ping {
        namespace Responses {
            export interface $200 {
                status?: "ok";
            }
        }
    }
}

export interface OperationMethods {
  /**
   * ping - Check the health of the Bulk Import backend router
   */
  'ping'(
    parameters?: Parameters<UnknownParamsObject> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.Ping.Responses.$200>
  /**
   * findAllOrganizations - Fetch Organizations accessible by Backstage Github Integrations
   */
  'findAllOrganizations'(
    parameters?: Parameters<Paths.FindAllOrganizations.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.FindAllOrganizations.Responses.$200>
  /**
   * findAllRepositories - Fetch Organization Repositories accessible by Backstage Github Integrations
   */
  'findAllRepositories'(
    parameters?: Parameters<Paths.FindAllRepositories.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.FindAllRepositories.Responses.$200>
  /**
   * findAllImports - Fetch Import Jobs
   */
  'findAllImports'(
    parameters?: Parameters<Paths.FindAllImports.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.FindAllImports.Responses.$200>
  /**
   * createImportJobs - Submit Import Jobs
   */
  'createImportJobs'(
    parameters?: Parameters<Paths.CreateImportJobs.QueryParameters> | null,
    data?: Paths.CreateImportJobs.RequestBody,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.CreateImportJobs.Responses.$202>
  /**
   * findImportStatusByRepo - Get Import Status by repository
   */
  'findImportStatusByRepo'(
    parameters?: Parameters<Paths.FindImportStatusByRepo.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.FindImportStatusByRepo.Responses.$200>
  /**
   * deleteImportByRepo - Delete Import by repository
   */
  'deleteImportByRepo'(
    parameters?: Parameters<Paths.DeleteImportByRepo.QueryParameters> | null,
    data?: any,
    config?: AxiosRequestConfig  
  ): OperationResponse<Paths.DeleteImportByRepo.Responses.$204>
}

export interface PathsDictionary {
  ['/ping']: {
    /**
     * ping - Check the health of the Bulk Import backend router
     */
    'get'(
      parameters?: Parameters<UnknownParamsObject> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.Ping.Responses.$200>
  }
  ['/organizations']: {
    /**
     * findAllOrganizations - Fetch Organizations accessible by Backstage Github Integrations
     */
    'get'(
      parameters?: Parameters<Paths.FindAllOrganizations.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.FindAllOrganizations.Responses.$200>
  }
  ['/repositories']: {
    /**
     * findAllRepositories - Fetch Organization Repositories accessible by Backstage Github Integrations
     */
    'get'(
      parameters?: Parameters<Paths.FindAllRepositories.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.FindAllRepositories.Responses.$200>
  }
  ['/imports']: {
    /**
     * findAllImports - Fetch Import Jobs
     */
    'get'(
      parameters?: Parameters<Paths.FindAllImports.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.FindAllImports.Responses.$200>
    /**
     * createImportJobs - Submit Import Jobs
     */
    'post'(
      parameters?: Parameters<Paths.CreateImportJobs.QueryParameters> | null,
      data?: Paths.CreateImportJobs.RequestBody,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.CreateImportJobs.Responses.$202>
  }
  ['/import/by-repo']: {
    /**
     * findImportStatusByRepo - Get Import Status by repository
     */
    'get'(
      parameters?: Parameters<Paths.FindImportStatusByRepo.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.FindImportStatusByRepo.Responses.$200>
    /**
     * deleteImportByRepo - Delete Import by repository
     */
    'delete'(
      parameters?: Parameters<Paths.DeleteImportByRepo.QueryParameters> | null,
      data?: any,
      config?: AxiosRequestConfig  
    ): OperationResponse<Paths.DeleteImportByRepo.Responses.$204>
  }
}

export type Client = OpenAPIClient<OperationMethods, PathsDictionary>

