import { useAsync } from 'react-use';

import { identityApiRef, useApi } from '@backstage/core-plugin-api';

export const useBackstageUserIdentity = () => {
  const identityApi = useApi(identityApiRef);
  const { value: user } = useAsync(async () => {
    const identityRef = await identityApi.getBackstageIdentity();
    return identityRef.userEntityRef;
  });
  return user;
};
