// Generated file. Do not edit.
const OPENAPI = `
{
  "openapi": "3.0.3",
  "info": {
    "title": "Notifications Plugin - OpenAPI Specs",
    "description": "Notifications Plugin - OpenAPI Specs",
    "version": "1.0.0"
  },
  "tags": [
    {
      "name": "notifications",
      "description": "notifications plugin"
    }
  ],
  "servers": [
    {
      "url": "http://localhost:7007/api/notifications"
    }
  ],
  "paths": {
    "/notifications": {
      "post": {
        "tags": [
          "notifications"
        ],
        "summary": "Create notification",
        "description": "Create notification",
        "operationId": "createNotification",
        "requestBody": {
          "description": "Create a new notification",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateBody"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful operation",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "messageId": {
                      "type": "string",
                      "example": "bc9f19de-8b7b-49a8-9262-c5036a1ed35e"
                    }
                  },
                  "required": [
                    "messageId"
                  ]
                }
              }
            }
          }
        }
      },
      "get": {
        "tags": [
          "notifications"
        ],
        "summary": "Gets notifications",
        "description": "Gets notifications",
        "operationId": "getNotifications",
        "parameters": [
          {
            "name": "pageSize",
            "in": "query",
            "description": "Page size of the result",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 0
            }
          },
          {
            "name": "pageNumber",
            "in": "query",
            "description": "Page number of the result",
            "required": false,
            "schema": {
              "type": "integer",
              "minimum": 0
            }
          },
          {
            "name": "orderBy",
            "in": "query",
            "description": "order by field. e.g. created, origin.",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "title",
                "message",
                "created",
                "topic",
                "origin"
              ]
            }
          },
          {
            "name": "orderByDirec",
            "in": "query",
            "description": "order ascending or descending",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "asc",
                "desc"
              ]
            }
          },
          {
            "name": "containsText",
            "in": "query",
            "description": "Filter notifications whose either title or message contains the provided string",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "createdAfter",
            "in": "query",
            "description": "Only notifications created after this timestamp will be included",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "messageScope",
            "in": "query",
            "description": "retrieve either logged-in user messages, system messages or both",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "all",
                "user",
                "system"
              ]
            }
          },
          {
            "name": "read",
            "in": "query",
            "description": "Notifications read or not",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful operation",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Notifications"
                }
              }
            }
          }
        }
      }
    },
    "/notifications/count": {
      "get": {
        "tags": [
          "notifications"
        ],
        "summary": "Get notifications count",
        "description": "Gets notifications count",
        "operationId": "getNotificationsCount",
        "parameters": [
          {
            "name": "containsText",
            "in": "query",
            "description": "Filter notifications whose either title or message contains the provided string",
            "required": false,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "createdAfter",
            "in": "query",
            "description": "Only notifications created after this timestamp will be included",
            "required": false,
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "messageScope",
            "in": "query",
            "description": "retrieve either logged-in user messages, system messages or both",
            "required": false,
            "schema": {
              "type": "string",
              "enum": [
                "all",
                "user",
                "system"
              ]
            }
          },
          {
            "name": "read",
            "in": "query",
            "description": "Notifications read or not",
            "required": false,
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful operation",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "count": {
                      "type": "number"
                    }
                  },
                  "required": [
                    "count"
                  ]
                }
              }
            }
          }
        }
      }
    },
    "/notifications/read": {
      "put": {
        "tags": [
          "notifications"
        ],
        "summary": "Set notification as read/unread",
        "description": "Set notification as read/unread",
        "operationId": "setRead",
        "parameters": [
          {
            "name": "messageId",
            "in": "query",
            "description": "The message ID",
            "required": true,
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "read",
            "in": "query",
            "description": "read/unread",
            "required": true,
            "schema": {
              "type": "boolean"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful operation"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Notifications": {
        "type": "array",
        "items": {
          "$ref": "#/components/schemas/Notification"
        }
      },
      "Notification": {
        "properties": {
          "id": {
            "type": "string"
          },
          "created": {
            "type": "string",
            "format": "date-time"
          },
          "readByUser": {
            "type": "boolean"
          },
          "isSystem": {
            "type": "boolean"
          },
          "origin": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "message": {
            "type": "string"
          },
          "topic": {
            "type": "string"
          },
          "actions": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Action"
            }
          }
        },
        "required": [
          "id",
          "created",
          "readByUser",
          "isSystem",
          "origin",
          "title",
          "actions"
        ]
      },
      "Action": {
        "properties": {
          "id": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "url": {
            "type": "string"
          }
        },
        "required": [
          "id",
          "title",
          "url"
        ]
      },
      "CreateBody": {
        "properties": {
          "origin": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "message": {
            "type": "string"
          },
          "actions": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "title": {
                  "type": "string"
                },
                "url": {
                  "type": "string"
                }
              },
              "required": [
                "title",
                "url"
              ]
            }
          },
          "topic": {
            "type": "string"
          },
          "targetUsers": {
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "targetGroups": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        },
        "required": [
          "origin",
          "title"
        ]
      }
    }
  }
}`;
export const openApiDocument = JSON.parse(OPENAPI);
