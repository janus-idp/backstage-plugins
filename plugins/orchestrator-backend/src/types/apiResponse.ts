export interface ApiResponse {
  message?: String;
  result?: any;
  backEndErrCd?: String;
}

export class ApiResponseBuilder {
  static SUCCESS_RESPONSE(result: any, message = 'success'): ApiResponse {
    return {
      result: result,
      message: message,
    };
  }

  static VALIDATION_ERR_RESPONSE(
    backEndErrCd = 'backend validation error code',
    message = 'backend validation error',
  ): ApiResponse {
    return {
      message: message,
      backEndErrCd: backEndErrCd,
    };
  }

  static HTTP_ERR_RESPONSE(message = 'Internal Server Error'): ApiResponse {
    return {
      result: null,
      message: message,
    };
  }
}
