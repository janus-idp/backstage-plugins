// GENERATED FILE. DO NOT EDIT.
const OPENAPI = `
{
  "openapi": "3.1.0",
  "info": {
    "title": "Orchestrator plugin",
    "description": "API to interact with orchestrator plugin",
    "license": {
      "name": "Apache 2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
    },
    "version": "0.0.1"
  },
  "servers": [
    {
      "url": "/"
    }
  ],
  "paths": {
    "/v2/workflows/overview": {
      "get": {
        "operationId": "getWorkflowsOverview",
        "description": "Get a list of workflow overviews",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/WorkflowOverviewListResultDTO"
                }
              }
            }
          },
          "500": {
            "description": "Error fetching workflow overviews",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "description": "Error message"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v2/workflows/{workflowId}/overview": {
      "get": {
        "operationId": "getWorkflowOverviewById",
        "description": "Get a workflow overview by ID",
        "parameters": [
          {
            "name": "workflowId",
            "in": "path",
            "required": true,
            "description": "Unique identifier of the workflow",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/WorkflowOverviewDTO"
                }
              }
            }
          },
          "500": {
            "description": "Error fetching workflow overview",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "description": "Error message"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v2/workflows": {
      "get": {
        "operationId": "getWorkflows",
        "description": "Get a list of workflow",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/WorkflowListResultDTO"
                }
              }
            }
          },
          "500": {
            "description": "Error fetching workflow list",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "description": "Error message"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v2/workflows/{workflowId}": {
      "get": {
        "operationId": "getWorkflowById",
        "description": "Get a workflow by ID",
        "parameters": [
          {
            "name": "workflowId",
            "in": "path",
            "required": true,
            "description": "Unique identifier of the workflow",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/WorkflowDTO"
                }
              }
            }
          },
          "500": {
            "description": "Error fetching workflow",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "description": "Error message"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v2/workflows/instances": {
      "get": {
        "operationId": "getInstances",
        "summary": "Get instances",
        "description": "Retrieve an array of instances",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProcessInstancesDTO"
                }
              }
            }
          },
          "500": {
            "description": "Error fetching instances",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "description": "Error message"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v2/workflows/instances/{instanceId}": {
      "get": {
        "summary": "Get Workflow Instance by ID",
        "operationId": "getInstanceById",
        "parameters": [
          {
            "name": "instanceId",
            "in": "path",
            "required": true,
            "description": "ID of the workflow instance",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProcessInstanceDTO"
                }
              }
            }
          },
          "500": {
            "description": "Internal Server Error",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "description": "Error message"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/v2/workflows/instances/{instanceId}/result": {
      "get": {
        "summary": "Get assessment results",
        "operationId": "getAssessmentResults",
        "parameters": [
          {
            "name": "instanceId",
            "in": "path",
            "required": true,
            "description": "ID of the workflow instance",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/WorkflowSuggestionsDTO"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "WorkflowOverviewListResultDTO": {
        "type": "object",
        "properties": {
          "overviews": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/WorkflowOverviewDTO"
            }
          },
          "paginationInfo": {
            "$ref": "#/components/schemas/PaginationInfoDTO"
          }
        }
      },
      "WorkflowOverviewDTO": {
        "type": "object",
        "properties": {
          "workflowId": {
            "type": "string",
            "description": "Workflow unique identifier",
            "minLength": 1
          },
          "name": {
            "type": "string",
            "description": "Workflow name",
            "minLength": 1
          },
          "uri": {
            "type": "string"
          },
          "lastTriggeredMs": {
            "type": "number",
            "minimum": 0
          },
          "lastRunStatus": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "minimum": 0
          },
          "avgDurationMs": {
            "type": "number",
            "minimum": 0
          },
          "description": {
            "type": "string"
          }
        }
      },
      "PaginationInfoDTO": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "number",
            "minimum": 0
          },
          "offset": {
            "type": "number",
            "minimum": 0
          },
          "totalCount": {
            "type": "number",
            "minimum": 0
          }
        },
        "additionalProperties": false
      },
      "WorkflowListResultDTO": {
        "type": "object",
        "properties": {
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/WorkflowDTO"
            }
          },
          "paginationInfo": {
            "$ref": "#/components/schemas/PaginationInfoDTO"
          }
        },
        "required": [
          "items",
          "paginationInfo"
        ]
      },
      "WorkflowDTO": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Workflow unique identifier",
            "minLength": 1
          },
          "name": {
            "type": "string",
            "description": "Workflow name",
            "minLength": 1
          },
          "uri": {
            "type": "string",
            "description": "URI of the workflow definition"
          },
          "category": {
            "$ref": "#/components/schemas/WorkflowCategoryDTO"
          },
          "description": {
            "type": "string",
            "description": "Description of the workflow"
          },
          "annotations": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "id",
          "category",
          "uri"
        ]
      },
      "WorkflowCategoryDTO": {
        "type": "string",
        "description": "Category of the workflow",
        "enum": [
          "assessment",
          "infrastructure"
        ],
        "x-enum-varnames": [
          "ASSESSMENT",
          "INFRASTRUCTURE"
        ],
        "x-enum-descriptions": [
          "Assessment Workflow",
          "Infrastructure Workflow"
        ]
      },
      "ProcessInstancesDTO": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ProcessInstanceDTO"
        }
      },
      "ProcessInstanceDTO": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
            "type": "string"
          },
          "workflow": {
            "type": "string"
          },
          "status": {
            "$ref": "#/components/schemas/ProcessInstanceStatusDTO"
          },
          "started": {
            "type": "string",
            "format": "date-time"
          },
          "duration": {
            "type": "string"
          },
          "category": {
            "$ref": "#/components/schemas/WorkflowCategoryDTO"
          },
          "description": {
            "type": "string"
          },
          "nextWorkflowSuggestions": {
            "$ref": "#/components/schemas/WorkflowSuggestionsDTO"
          }
        }
      },
      "WorkflowSuggestionsDTO": {
        "type": "object",
        "additionalProperties": {
          "$ref": "#/components/schemas/WorkflowSuggestionDTO"
        }
      },
      "WorkflowSuggestionDTO": {
        "type": "object",
        "properties": {
          "suggestion": {
            "type": "string"
          },
          "workflow": {
            "type": "string"
          }
        }
      },
      "ProcessInstanceStatusDTO": {
        "type": "string",
        "description": "Status of the workflow run",
        "enum": [
          "Running",
          "Error",
          "Completed",
          "Aborted",
          "Suspended"
        ],
        "x-enum-varnames": [
          "RUNNING",
          "ERROR",
          "COMPLETED",
          "ABORTED",
          "SUSPENDED"
        ],
        "x-enum-descriptions": [
          "Running",
          "Error",
          "Completed",
          "Aborted",
          "Suspended"
        ]
      }
    }
  }
}`;
export const openApiDocument = JSON.parse(OPENAPI);
