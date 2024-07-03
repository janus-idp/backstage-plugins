// GENERATED FILE. DO NOT EDIT.

// eslint-disable
// prettier-ignore
const OPENAPI = `
{
  "openapi": "3.1.0",
  "info": {
    "version": "1.0",
    "title": "Bulk Import Backend",
    "description": "The Bulk Import Backend APIs allow users to bulk import Backstage entities into the backstage catalog from remote sources such as Git."
  },
  "servers": [
    {
      "url": "{protocol}://{host}:{port}/{basePath}",
      "variables": {
        "protocol": {
          "enum": [
            "http",
            "https"
          ],
          "default": "http"
        },
        "host": {
          "default": "localhost"
        },
        "port": {
          "default": "7007"
        },
        "basePath": {
          "default": "api/bulk-import-backend"
        }
      }
    }
  ],
  "paths": {
    "/ping": {
      "get": {
        "operationId": "ping",
        "summary": "Check the health of the Bulk Import backend router",
        "tags": [
          "Management"
        ],
        "responses": {
          "200": {
            "description": "The backend router for the Bulk Import backend is up and running",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "enum": [
                        "ok"
                      ]
                    }
                  }
                },
                "example": {
                  "status": "ok"
                }
              }
            }
          }
        }
      }
    },
    "/organizations": {
      "get": {
        "operationId": "findAllOrganizations",
        "summary": "Fetch Organizations accessible by Backstage Github Integrations",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "tags": [
          "Organization"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "pagePerIntegration",
            "description": "the page number for each Integration",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "in": "query",
            "name": "sizePerIntegration",
            "description": "the number of items per Integration to return per page",
            "schema": {
              "type": "integer",
              "default": 20
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Organization list was fetched successfully with no errors",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/OrganizationList"
                },
                "examples": {
                  "multipleRepos": {
                    "$ref": "#/components/examples/multipleOrgs"
                  }
                }
              }
            }
          },
          "500": {
            "description": "Generic error when there are errors and no Organization is returned",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/OrganizationList"
                },
                "examples": {
                  "repositoryListErrors": {
                    "$ref": "#/components/examples/orgListErrors"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/organizations/{organizationName}/repositories": {
      "get": {
        "operationId": "findRepositoriesByOrganization",
        "summary": "Fetch Repositories in the specified GitHub organization, provided it is accessible by any of the configured GitHub Integrations.",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "tags": [
          "Organization"
        ],
        "parameters": [
          {
            "in": "path",
            "name": "organizationName",
            "description": "Organization name",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "checkImportStatus",
            "description": "whether to return import status. Note that this might incur a performance penalty because the import status is computed for each repository.",
            "schema": {
              "type": "boolean",
              "default": "false"
            }
          },
          {
            "in": "query",
            "name": "pagePerIntegration",
            "description": "the page number for each Integration",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "in": "query",
            "name": "sizePerIntegration",
            "description": "the number of items per Integration to return per page",
            "schema": {
              "type": "integer",
              "default": 20
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Org Repository list was fetched successfully with no errors",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RepositoryList"
                },
                "examples": {
                  "multipleRepos": {
                    "$ref": "#/components/examples/multipleRepos"
                  }
                }
              }
            }
          },
          "500": {
            "description": "Generic error when there are errors and no Org Repository is returned",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RepositoryList"
                },
                "examples": {
                  "repositoryListErrors": {
                    "$ref": "#/components/examples/repositoryListErrors"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/repositories": {
      "get": {
        "operationId": "findAllRepositories",
        "summary": "Fetch Organization Repositories accessible by Backstage Github Integrations",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "tags": [
          "Repository"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "checkImportStatus",
            "description": "whether to return import status. Note that this might incur a performance penalty because the import status is computed for each repository.",
            "schema": {
              "type": "boolean",
              "default": "false"
            }
          },
          {
            "in": "query",
            "name": "pagePerIntegration",
            "description": "the page number for each Integration",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "in": "query",
            "name": "sizePerIntegration",
            "description": "the number of items per Integration to return per page",
            "schema": {
              "type": "integer",
              "default": 20
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Repository list was fetched successfully with no errors",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RepositoryList"
                },
                "examples": {
                  "multipleRepos": {
                    "$ref": "#/components/examples/multipleRepos"
                  }
                }
              }
            }
          },
          "500": {
            "description": "Generic error when there are errors and no repository is returned",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RepositoryList"
                },
                "examples": {
                  "repositoryListErrors": {
                    "$ref": "#/components/examples/repositoryListErrors"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/imports": {
      "get": {
        "operationId": "findAllImports",
        "summary": "Fetch Import Jobs",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "tags": [
          "Import"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "pagePerIntegration",
            "description": "the page number for each Integration",
            "schema": {
              "type": "integer",
              "default": 1
            }
          },
          {
            "in": "query",
            "name": "sizePerIntegration",
            "description": "the number of items per Integration to return per page",
            "schema": {
              "type": "integer",
              "default": 20
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Import Jobs list was fetched successfully with no errors",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Import"
                  }
                },
                "examples": {
                  "twoImports": {
                    "$ref": "#/components/examples/twoImports"
                  }
                }
              }
            }
          },
          "500": {
            "description": "Generic error"
          }
        }
      },
      "post": {
        "operationId": "createImportJobs",
        "summary": "Submit Import Jobs",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "tags": [
          "Import"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "dryRun",
            "description": "whether to perform a dry-run to check if entity name collisions would occur in the catalog",
            "schema": {
              "type": "boolean",
              "default": "false"
            }
          }
        ],
        "requestBody": {
          "description": "List of Import jobs to create",
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ImportRequest"
                }
              },
              "examples": {
                "multipleImportRequests": {
                  "$ref": "#/components/examples/multipleImportRequests"
                }
              }
            }
          }
        },
        "responses": {
          "202": {
            "description": "Import Jobs request was submitted successfully to the API. Check the status in each item of the response body list to see their individual status.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Import"
                  }
                },
                "examples": {
                  "twoImports": {
                    "$ref": "#/components/examples/twoImports"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/import/by-repo": {
      "get": {
        "operationId": "findImportStatusByRepo",
        "summary": "Get Import Status by repository",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "tags": [
          "Import"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "repo",
            "description": "the full URL to the repo",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "defaultBranch",
            "description": "the name of the default branch",
            "schema": {
              "type": "string",
              "default": "main"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Import Job status was determined successfully with no errors",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Import"
                },
                "examples": {
                  "singleImportStatusForRepo": {
                    "$ref": "#/components/examples/singleImportStatusForRepo"
                  }
                }
              }
            }
          },
          "500": {
            "description": "Generic error"
          }
        }
      },
      "delete": {
        "operationId": "deleteImportByRepo",
        "summary": "Delete Import by repository",
        "security": [
          {
            "BearerAuth": []
          }
        ],
        "tags": [
          "Import"
        ],
        "parameters": [
          {
            "in": "query",
            "name": "repo",
            "description": "the full URL to the repo",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "defaultBranch",
            "description": "the name of the default branch",
            "schema": {
              "type": "string",
              "default": "main"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "Import Job was successfully delete with no errors"
          },
          "500": {
            "description": "Generic error"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "OrganizationList": {
        "title": "Organization List",
        "type": "object",
        "properties": {
          "organizations": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Organization"
            }
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "totalCount": {
            "type": "integer"
          },
          "pagePerIntegration": {
            "type": "integer"
          },
          "sizePerIntegration": {
            "type": "integer"
          }
        }
      },
      "Organization": {
        "title": "Organization",
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "unique identifier"
          },
          "name": {
            "type": "string",
            "description": "organization name"
          },
          "description": {
            "type": "string",
            "description": "organization description"
          },
          "url": {
            "type": "string",
            "description": "organization URL"
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "RepositoryList": {
        "title": "Repository List",
        "type": "object",
        "properties": {
          "repositories": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Repository"
            }
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "totalCount": {
            "type": "integer"
          },
          "pagePerIntegration": {
            "type": "integer"
          },
          "sizePerIntegration": {
            "type": "integer"
          }
        }
      },
      "Repository": {
        "title": "Repository",
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "unique identifier"
          },
          "name": {
            "type": "string",
            "description": "repository name"
          },
          "url": {
            "type": "string",
            "description": "repository URL"
          },
          "organization": {
            "type": "string",
            "description": "organization which the repository is part of"
          },
          "importStatus": {
            "$ref": "#/components/schemas/ImportStatus"
          },
          "defaultBranch": {
            "type": "string",
            "description": "default branch"
          },
          "lastUpdate": {
            "type": "string",
            "format": "date-time"
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      },
      "ApprovalTool": {
        "type": "string",
        "enum": [
          "GIT",
          "SERVICENOW"
        ]
      },
      "ImportStatus": {
        "type": "string",
        "nullable": true,
        "description": "Import Job status",
        "enum": [
          "ADDED",
          "WAIT_PR_APPROVAL",
          "PR_ERROR",
          null
        ]
      },
      "Import": {
        "title": "Import Job",
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "status": {
            "$ref": "#/components/schemas/ImportStatus"
          },
          "catalogEntityName": {
            "type": "string",
            "description": "Specified entity name in the catalog. Filled only in response for dry-run import requests."
          },
          "lastUpdate": {
            "type": "string",
            "format": "date-time"
          },
          "errors": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "approvalTool": {
            "$ref": "#/components/schemas/ApprovalTool"
          },
          "repository": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "repository name"
              },
              "url": {
                "type": "string",
                "description": "repository URL"
              },
              "organization": {
                "type": "string",
                "description": "organization which the repository is part of"
              }
            }
          },
          "github": {
            "type": "object",
            "description": "GitHub details. Applicable if approvalTool is git.",
            "properties": {
              "pullRequest": {
                "type": "object",
                "properties": {
                  "url": {
                    "type": "string",
                    "description": "URL of the Pull Request"
                  },
                  "number": {
                    "type": "number",
                    "description": "Pull Request number"
                  }
                }
              }
            }
          }
        }
      },
      "ImportRequest": {
        "title": "Import Job request",
        "type": "object",
        "required": [
          "repository"
        ],
        "properties": {
          "approvalTool": {
            "$ref": "#/components/schemas/ApprovalTool"
          },
          "catalogEntityName": {
            "type": "string",
            "description": "Expected Entity name in the catalog. Relevant only if the 'dryRun' query parameter is set to 'true'."
          },
          "repository": {
            "type": "object",
            "required": [
              "url"
            ],
            "properties": {
              "name": {
                "type": "string",
                "description": "repository name"
              },
              "url": {
                "type": "string",
                "description": "repository URL"
              },
              "organization": {
                "type": "string",
                "description": "organization which the repository is part of"
              },
              "defaultBranch": {
                "type": "string",
                "description": "default branch"
              }
            }
          },
          "catalogInfoContent": {
            "type": "string",
            "description": "content of the catalog-info.yaml to include in the import Pull Request."
          },
          "github": {
            "type": "object",
            "description": "GitHub details. Applicable if approvalTool is git.",
            "properties": {
              "pullRequest": {
                "type": "object",
                "description": "Pull Request details. Applicable if approvalTool is git.",
                "properties": {
                  "title": {
                    "type": "string",
                    "description": "title of the Pull Request"
                  },
                  "body": {
                    "type": "string",
                    "description": "body of the Pull Request"
                  }
                }
              }
            }
          }
        }
      }
    },
    "securitySchemes": {
      "BearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "Backstage Permissions Framework JWT"
      }
    },
    "examples": {
      "multipleOrgs": {
        "summary": "Multiple organizations",
        "value": {
          "errors": [],
          "organizations": [
            {
              "id": "unique-org-id-1",
              "name": "pet-org",
              "url": "https://github.com/pet-org",
              "description": "A great Pet Org"
            },
            {
              "id": "unique-org-id-2",
              "name": "org-zero",
              "url": "https://ghe.example.com/org-zero"
            },
            {
              "id": "unique-id-2",
              "name": "org-one",
              "url": "https://ghe.example.com/org-one",
              "description": "Org One description"
            }
          ]
        }
      },
      "orgListErrors": {
        "summary": "Errors when listing organizations",
        "value": {
          "errors": [
            "Github App with ID 2 failed spectacularly"
          ],
          "organizations": []
        }
      },
      "multipleRepos": {
        "summary": "Multiple repositories",
        "value": {
          "errors": [],
          "repositories": [
            {
              "id": "unique-id-1",
              "name": "pet-app",
              "url": "https://github.com/my-org/pet-app",
              "organization": "my-org",
              "importStatus": "WAIT_PR_APPROVAL",
              "defaultBranch": "main"
            },
            {
              "id": "unique-id-2",
              "name": "project-zero",
              "url": "https://ghe.example.com/my-other-org/project-zero",
              "organization": "my-other-org",
              "importStatus": "PR_REJECTED",
              "defaultBranch": "dev"
            },
            {
              "id": "unique-id-2",
              "name": "project-one",
              "defaultBranch": "trunk",
              "url": "https://ghe.example.com/my-other-org-2/project-one",
              "organization": "my-other-org-2"
            }
          ]
        }
      },
      "repositoryListErrors": {
        "summary": "Errors when listing repositories",
        "value": {
          "errors": [
            "Github App with ID 2 failed spectacularly"
          ],
          "repositories": []
        }
      },
      "twoImports": {
        "summary": "Two import job requests",
        "value": [
          {
            "id": "bulk-import-id-1",
            "status": "WAIT_PR_APPROVAL",
            "errors": [],
            "approvalTool": "GIT",
            "repository": {
              "name": "pet-app",
              "url": "https://github.com/my-org/pet-app",
              "organization": "my-org"
            },
            "github": {
              "pullRequest": {
                "url": "https://github.com/my-org/pet-app/pull/1",
                "number": 1
              }
            }
          },
          {
            "id": "bulk-import-id-2",
            "status": "PR_REJECTED",
            "errors": [],
            "approvalTool": "GIT",
            "repository": {
              "name": "pet-app-test",
              "url": "https://github.com/my-org/pet-app-test",
              "organization": "my-org"
            },
            "github": {
              "pullRequest": {
                "url": "https://github.com/my-org/pet-app-test/pull/10",
                "number": 10
              }
            }
          }
        ]
      },
      "singleImportStatusForRepo": {
        "summary": "Single import job status for given repo",
        "value": {
          "id": "bulk-import-id-1",
          "status": "WAIT_PR_APPROVAL",
          "errors": [],
          "approvalTool": "GIT",
          "repository": {
            "name": "pet-app",
            "url": "https://github.com/my-org/pet-app",
            "organization": "my-org"
          },
          "github": {
            "pullRequest": {
              "url": "https://github.com/my-org/pet-app/pull/1",
              "number": 1
            }
          }
        }
      },
      "multipleImportRequests": {
        "summary": "Multiple import requests",
        "value": [
          {
            "approvalTool": "GIT",
            "repository": {
              "name": "pet-app",
              "url": "https://github.com/my-org/pet-app",
              "organization": "my-org",
              "defaultBranch": "main"
            },
            "github": {
              "pullRequest": {
                "title": "Add default catalog-info.yaml to import to Red Hat Developer Hub"
              }
            }
          },
          {
            "approvalTool": "GIT",
            "repository": {
              "name": "project-zero",
              "url": "https://ghe.example.com/my-other-org/project-zero",
              "organization": "my-other-org",
              "defaultBranch": "dev"
            },
            "github": {
              "pullRequest": {
                "title": "Add custom catalog-info.yaml to import to Red Hat Developer Hub",
                "body": "This pull request adds a **Backstage entity metadata file** to this repository so that the component can be added to the Red Hat Developer Hub software catalog.\\n\\nAfter this pull request is merged, the component will become available.\\n\\nFor more information, read an [overview of the Backstage software catalog](https://backstage.io/docs/features/software-catalog/)."
              }
            },
            "catalogInfoContent": "apiVersion: backstage.io/v1alpha1\\nkind: Component\\nmetadata:\\n  name: project-zero\\n  annotations:\\n    github.com/project-slug: my-other-org/project-zero\\n    acme.com/custom-annotation: my-value\\nspec:\\n  type: other\\n  lifecycle: unknown\\n  owner: my-other-org"
          }
        ]
      }
    }
  }
}`
export const openApiDocument = JSON.parse(OPENAPI);
