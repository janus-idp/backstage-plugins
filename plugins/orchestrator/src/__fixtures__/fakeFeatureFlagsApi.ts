import {
  FeatureFlag,
  FeatureFlagsApi,
  FeatureFlagsSaveOptions,
} from '@backstage/core-plugin-api';

export const createFakeFeatureFlagsApi = (
  activeFeatureFlags?: string[],
): FeatureFlagsApi => ({
  registerFlag: (_flag: FeatureFlag) => {
    throw new Error('Function not implemented.');
  },
  getRegisteredFlags: (): FeatureFlag[] => {
    throw new Error('Function not implemented.');
  },
  isActive: (name: string): boolean => {
    return !!activeFeatureFlags?.includes(name);
  },
  save: (_options: FeatureFlagsSaveOptions): void => {
    throw new Error('Function not implemented.');
  },
});
