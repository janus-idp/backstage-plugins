export const DefaultPageNumber = 1;
export const DefaultPageSize = 20;

export interface HandlerResponse<ResponseBody = any> {
  statusCode: number;
  responseBody?: ResponseBody;
}
