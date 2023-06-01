import { kubernetesObject } from './kubernetesObject';

export const kubernetesObjectsWithError = {
  items: [
    {
      ...kubernetesObject.items[0],
      errors: [{ errorType: 'FETCH_ERROR', message: 'Couldnt fetch resources' }],
    },
  ],
};
