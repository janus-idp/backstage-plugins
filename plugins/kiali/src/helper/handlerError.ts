import { KialiFetchError } from '@janus-idp/backstage-plugin-kiali-common';

export const handleMessage = (e: KialiFetchError) => {
  const codeMsg = e.statusCode ? `, Code: ${e.statusCode}` : '';
  const resource = e.resourcePath ? ` fetching ${e.resourcePath} ` : '';
  return `[${e.errorType.toString()}]${codeMsg}${resource}:  ${e.message}`;
};

export const handleMultipleMessage = (errors: KialiFetchError[]) => {
  return errors.map(e => handleMessage(e)).join('\n');
};
