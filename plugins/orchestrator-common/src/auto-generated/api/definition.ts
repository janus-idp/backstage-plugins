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
              "text/plain": {
                "schema": {
                  "type": "string"
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
              "text/plain": {
                "schema": {
                  "type": "string"
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
              "text/plain": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      },
      "post": {
        "operationId": "createWorkflow",
        "summary": "Create or update a workflow",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "uri": {
                    "type": "string"
                  },
                  "body": {
                    "type": "string"
                  }
                },
                "required": [
                  "uri"
                ]
              }
            }
          }
        },
        "parameters": [
          {
            "name": "uri",
            "in": "query",
            "description": "URI parameter",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "201": {
            "description": "Created",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "workflowItem": {
                      "$ref": "#/components/schemas/WorkflowDTO"
                    }
                  }
                }
              }
            }
          },
          "500": {
            "description": "Error creating workflow",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "string"
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
              "text/plain": {
                "schema": {
                  "type": "string"
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
            "description": "Error fetching instance",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/v2/workflows/instances/{instanceId}/results": {
      "get": {
        "summary": "Get assessment results",
        "operationId": "getWorkflowResults",
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
                  "$ref": "#/components/schemas/WorkflowDataDTO"
                }
              }
            }
          },
          "500": {
            "description": "Error getting workflow results",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/v2/workflows/instances/statuses": {
      "get": {
        "operationId": "getWorkflowStatuses",
        "summary": "Get workflow status list",
        "description": "Retrieve an array of workflow statuses",
        "responses": {
          "200": {
            "description": "Success",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/WorkflowRunStatusDTO"
                  }
                }
              }
            }
          },
          "500": {
            "description": "Error fetching workflow statuses",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/v2/workflows/{workflowId}/execute": {
      "post": {
        "summary": "Execute a workflow",
        "operationId": "executeWorkflow",
        "parameters": [
          {
            "name": "workflowId",
            "in": "path",
            "description": "ID of the workflow to execute",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ExecuteWorkflowRequestDTO"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful execution",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ExecuteWorkflowResponseDTO"
                }
              }
            }
          },
          "500": {
            "description": "Internal Server Error",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "string"
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
          "category": {
            "$ref": "#/components/schemas/WorkflowCategoryDTO"
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
      "WorkflowCategoryDTO": {
        "type": "string",
        "description": "Category of the workflow",
        "enum": [
          "assessment",
          "infrastructure"
        ]
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
      "ProcessInstancesDTO": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/ProcessInstanceDTO"
        }
      },
      "AssessedProcessInstanceDTO": {
        "type": "object",
        "properties": {
          "instance": {
            "$ref": "#/components/schemas/ProcessInstanceDTO"
          },
          "assessedBy": {
            "$ref": "#/components/schemas/ProcessInstanceDTO"
          }
        },
        "required": [
          "instance"
        ]
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
          "workflowdata": {
            "$ref": "#/components/schemas/WorkflowDataDTO"
          }
        }
      },
      "WorkflowDataDTO": {
        "type": "object",
        "properties": {
          "workflowoptions": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/WorkflowOptionsDTO"
            }
          }
        },
        "additionalProperties": true
      },
      "WorkflowOptionsDTO": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/WorkflowSuggestionDTO"
        }
      },
      "WorkflowSuggestionDTO": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "name": {
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
        ]
      },
      "WorkflowRunStatusDTO": {
        "type": "object",
        "properties": {
          "key": {
            "type": "string"
          },
          "value": {
            "type": "string"
          }
        }
      },
      "ExecuteWorkflowRequestDTO": {
        "type": "object",
        "properties": {
          "inputData": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          }
        },
        "required": [
          "inputData"
        ]
      },
      "ExecuteWorkflowResponseDTO": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          }
        }
      }
    }
  }
}`;
export const openApiDocument = JSON.parse(OPENAPI);
