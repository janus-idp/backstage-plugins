/* eslint-disable */
/* prettier-ignore */
// GENERATED FILE DO NOT EDIT.
const OPENAPI = `{"openapi":"3.1.0","info":{"title":"Orchestratorplugin","description":"APItointeractwithorchestratorplugin","license":{"name":"Apache2.0","url":"http://www.apache.org/licenses/LICENSE-2.0.html"},"version":"0.0.1"},"servers":[{"url":"/"}],"paths":{"/v2/workflows/overview":{"get":{"operationId":"getWorkflowsOverview","description":"Getalistofworkflowoverviews","parameters":[{"name":"page","in":"query","description":"pagenumber","schema":{"type":"number"}},{"name":"pageSize","in":"query","description":"pagesize","schema":{"type":"number"}},{"name":"orderBy","in":"query","description":"fieldnametoorderthedata","schema":{"type":"string"}},{"name":"orderDirection","in":"query","description":"ascendingordescending","schema":{"type":"string"}}],"responses":{"200":{"description":"Success","content":{"application/json":{"schema":{"$ref":"#/components/schemas/WorkflowOverviewListResultDTO"}}}},"500":{"description":"Errorfetchingworkflowoverviews","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ErrorResponse"}}}}}}},"/v2/workflows/{workflowId}/overview":{"get":{"operationId":"getWorkflowOverviewById","description":"GetaworkflowoverviewbyID","parameters":[{"name":"workflowId","in":"path","required":true,"description":"Uniqueidentifieroftheworkflow","schema":{"type":"string"}}],"responses":{"200":{"description":"Success","content":{"application/json":{"schema":{"$ref":"#/components/schemas/WorkflowOverviewDTO"}}}},"500":{"description":"Errorfetchingworkflowoverview","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ErrorResponse"}}}}}}},"/v2/workflows/{workflowId}":{"get":{"operationId":"getWorkflowById","description":"GetaworkflowbyID","parameters":[{"name":"workflowId","in":"path","description":"IDoftheworkflowtofetch","required":true,"schema":{"type":"string"}}],"responses":{"200":{"description":"Success","content":{"application/json":{"schema":{"$ref":"#/components/schemas/WorkflowDTO"}}}},"500":{"description":"Errorfetchingworkflowbyid","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ErrorResponse"}}}}}}},"/v2/workflows/{workflowId}/source":{"get":{"operationId":"getWorkflowSourceById","description":"GetaworkflowsourcebyID","parameters":[{"name":"workflowId","in":"path","description":"IDoftheworkflowtofetch","required":true,"schema":{"type":"string"}}],"responses":{"200":{"description":"Success","content":{"text/plain":{"schema":{"type":"string"}}}},"500":{"description":"Errorfetchingworkflowsourcebyid","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ErrorResponse"}}}}}}},"/v2/workflows/instances":{"get":{"operationId":"getInstances","summary":"Getinstances","description":"Retrieveanarrayofinstances","parameters":[{"name":"page","in":"query","description":"pagenumber","schema":{"type":"number"}},{"name":"pageSize","in":"query","description":"pagesize","schema":{"type":"number"}},{"name":"orderBy","in":"query","description":"fieldnametoorderthedata","schema":{"type":"string"}},{"name":"orderDirection","in":"query","description":"ascendingordescending","schema":{"type":"string"}}],"responses":{"200":{"description":"Success","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ProcessInstanceListResultDTO"}}}},"500":{"description":"Errorfetchinginstances","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ErrorResponse"}}}}}}},"/v2/workflows/instances/{instanceId}":{"get":{"summary":"GetWorkflowInstancebyID","operationId":"getInstanceById","parameters":[{"name":"instanceId","in":"path","required":true,"description":"IDoftheworkflowinstance","schema":{"type":"string"}},{"name":"includeAssessment","in":"query","required":false,"description":"Whethertoincludeassessment","schema":{"type":"boolean","default":false}}],"responses":{"200":{"description":"Successfulresponse","content":{"application/json":{"schema":{"$ref":"#/components/schemas/AssessedProcessInstanceDTO"}}}},"500":{"description":"Errorfetchinginstance","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ErrorResponse"}}}}}}},"/v2/workflows/instances/statuses":{"get":{"operationId":"getWorkflowStatuses","summary":"Getworkflowstatuslist","description":"Retrieveanarrayofworkflowstatuses","responses":{"200":{"description":"Success","content":{"application/json":{"schema":{"type":"array","items":{"$ref":"#/components/schemas/WorkflowRunStatusDTO"}}}}},"500":{"description":"Errorfetchingworkflowstatuses","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ErrorResponse"}}}}}}},"/v2/workflows/{workflowId}/execute":{"post":{"summary":"Executeaworkflow","operationId":"executeWorkflow","parameters":[{"name":"workflowId","in":"path","description":"IDoftheworkflowtoexecute","required":true,"schema":{"type":"string"}}],"requestBody":{"required":true,"content":{"application/json":{"schema":{"$ref":"#/components/schemas/ExecuteWorkflowRequestDTO"}}}},"responses":{"200":{"description":"Successfulexecution","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ExecuteWorkflowResponseDTO"}}}},"500":{"description":"InternalServerError","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ErrorResponse"}}}}}}},"/v2/instances/{instanceId}/abort":{"delete":{"summary":"Abortaworkflowinstance","operationId":"abortWorkflow","description":"AbortsaworkflowinstanceidentifiedbytheprovidedinstanceId.","parameters":[{"name":"instanceId","in":"path","required":true,"description":"Theidentifieroftheworkflowinstancetoabort.","schema":{"type":"string"}}],"responses":{"200":{"description":"Successfuloperation","content":{"text/plain":{"schema":{"type":"string"}}}},"500":{"description":"Errorabortingworkflow","content":{"application/json":{"schema":{"$ref":"#/components/schemas/ErrorResponse"}}}}}}}},"components":{"schemas":{"ErrorResponse":{"description":"TheErrorResponseobjectrepresentsacommonstructureforhandlingerrorsinAPIresponses.Itincludesessentialinformationabouttheerror,suchastheerrormessageandadditionaloptionaldetails.","type":"object","properties":{"message":{"description":"Astringprovidingaconciseandhuman-readabledescriptionoftheencounterederror.ThisfieldisrequiredintheErrorResponseobject.","type":"string","default":"internalservererror"},"additionalInfo":{"description":"Anoptionalfieldthatcancontainadditionalinformationorcontextabouttheerror.Itprovidesflexibilityforincludingextradetailsbasedonspecificerrorscenarios.","type":"string"}},"required":["message"]},"WorkflowOverviewListResultDTO":{"type":"object","properties":{"overviews":{"type":"array","items":{"$ref":"#/components/schemas/WorkflowOverviewDTO"},"minItems":0},"paginationInfo":{"$ref":"#/components/schemas/PaginationInfoDTO"}}},"WorkflowOverviewDTO":{"type":"object","properties":{"workflowId":{"type":"string","description":"Workflowuniqueidentifier","minLength":1},"name":{"type":"string","description":"Workflowname","minLength":1},"format":{"$ref":"#/components/schemas/WorkflowFormatDTO"},"lastRunId":{"type":"string"},"lastTriggeredMs":{"type":"number","minimum":0},"lastRunStatus":{"type":"string"},"category":{"$ref":"#/components/schemas/WorkflowCategoryDTO"},"avgDurationMs":{"type":"number","minimum":0},"description":{"type":"string"}},"required":["workflowId","format"]},"PaginationInfoDTO":{"type":"object","properties":{"pageSize":{"type":"number"},"page":{"type":"number"},"totalCount":{"type":"number"},"orderDirection":{"enum":["ASC","DESC"]},"orderBy":{"type":"string"}},"additionalProperties":false},"WorkflowFormatDTO":{"type":"string","description":"Formatoftheworkflowdefinition","enum":["yaml","json"]},"WorkflowCategoryDTO":{"type":"string","description":"Categoryoftheworkflow","enum":["assessment","infrastructure"]},"WorkflowListResultDTO":{"type":"object","properties":{"items":{"type":"array","items":{"$ref":"#/components/schemas/WorkflowDTO"}},"paginationInfo":{"$ref":"#/components/schemas/PaginationInfoDTO"}},"required":["items","paginationInfo"]},"WorkflowDTO":{"type":"object","properties":{"id":{"type":"string","description":"Workflowuniqueidentifier","minLength":1},"name":{"type":"string","description":"Workflowname","minLength":1},"format":{"$ref":"#/components/schemas/WorkflowFormatDTO"},"category":{"$ref":"#/components/schemas/WorkflowCategoryDTO"},"description":{"type":"string","description":"Descriptionoftheworkflow"},"annotations":{"type":"array","items":{"type":"string"}}},"required":["id","category","format"]},"ProcessInstanceListResultDTO":{"type":"object","properties":{"items":{"type":"array","items":{"$ref":"#/components/schemas/ProcessInstanceDTO"}},"paginationInfo":{"$ref":"#/components/schemas/PaginationInfoDTO"}}},"AssessedProcessInstanceDTO":{"type":"object","properties":{"instance":{"$ref":"#/components/schemas/ProcessInstanceDTO"},"assessedBy":{"$ref":"#/components/schemas/ProcessInstanceDTO"}},"required":["instance"]},"ProcessInstanceDTO":{"type":"object","properties":{"id":{"type":"string"},"processId":{"type":"string"},"processName":{"type":"string"},"status":{"$ref":"#/components/schemas/ProcessInstanceStatusDTO"},"endpoint":{"type":"string"},"serviceUrl":{"type":"string"},"start":{"type":"string"},"end":{"type":"string"},"duration":{"type":"string"},"category":{"$ref":"#/components/schemas/WorkflowCategoryDTO"},"description":{"type":"string"},"workflowdata":{"$ref":"#/components/schemas/WorkflowDataDTO"},"businessKey":{"type":"string"},"nodes":{"type":"array","items":{"$ref":"#/components/schemas/NodeInstanceDTO"}},"error":{"$ref":"#/components/schemas/ProcessInstanceErrorDTO"},"variables":{"$ref":"#/components/schemas/ProcessInstanceVariablesDTO"}},"required":["id","processId","nodes"]},"WorkflowDataDTO":{"type":"object","properties":{"workflowoptions":{"type":"array","items":{"$ref":"#/components/schemas/WorkflowOptionsDTO"}}},"additionalProperties":true},"WorkflowOptionsDTO":{"type":"array","items":{"$ref":"#/components/schemas/WorkflowSuggestionDTO"}},"WorkflowSuggestionDTO":{"type":"object","properties":{"id":{"type":"string"},"name":{"type":"string"}}},"ProcessInstanceStatusDTO":{"type":"string","description":"Statusoftheworkflowrun","enum":["Active","Error","Completed","Aborted","Suspended","Pending"]},"WorkflowRunStatusDTO":{"type":"object","properties":{"key":{"type":"string"},"value":{"type":"string"}}},"ExecuteWorkflowRequestDTO":{"type":"object","properties":{"inputData":{"type":"object","additionalProperties":true}},"required":["inputData"]},"ExecuteWorkflowResponseDTO":{"type":"object","properties":{"id":{"type":"string"}}},"WorkflowProgressDTO":{"allOf":[{"$ref":"#/components/schemas/NodeInstanceDTO"},{"type":"object","properties":{"status":{"$ref":"#/components/schemas/ProcessInstanceStatusDTO"},"error":{"$ref":"#/components/schemas/ProcessInstanceErrorDTO"}}}]},"NodeInstanceDTO":{"type":"object","properties":{"__typename":{"type":"string","default":"NodeInstance","description":"Typename"},"id":{"type":"string","description":"NodeinstanceID"},"name":{"type":"string","description":"Nodename"},"type":{"type":"string","description":"Nodetype"},"enter":{"type":"string","description":"Datewhenthenodewasentered"},"exit":{"type":"string","description":"Datewhenthenodewasexited(optional)"},"definitionId":{"type":"string","description":"DefinitionID"},"nodeId":{"type":"string","description":"NodeID"}},"required":["id"]},"ProcessInstanceErrorDTO":{"type":"object","properties":{"__typename":{"type":"string","default":"ProcessInstanceError","description":"Typename"},"nodeDefinitionId":{"type":"string","description":"NodedefinitionID"},"message":{"type":"string","description":"Errormessage(optional)"}},"required":["nodeDefinitionId"]},"ProcessInstanceVariablesDTO":{"type":"object","additionalProperties":true}}}}`;
export const openApiDocument = JSON.parse(OPENAPI);
