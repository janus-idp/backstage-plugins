import { create } from 'zustand';
import type { Layer, Tag } from '../types';

export type QuayStore = {
  repoTags: Record<string, Tag[]>;
  tagManifestLayers: Record<string, Layer>;
  setRepoTags: (org: string, repo: string, tags: Tag[]) => void;
  setTagManifestLayers: (digest: string, layer: Layer) => void;
};

/**
 * This is a global store for Quay data so that it can be shared
 * between components without having to pass it down through props.
 */
export const useQuayStore = create<QuayStore>(set => ({
  repoTags: {},
  tagManifestLayers: {},
  setRepoTags: (org, repo, tags) => {
    set(state => ({
      repoTags: {
        ...state.repoTags,
        [`${org}/${repo}`]: tags,
      },
    }));
  },
  setTagManifestLayers: (tag, layer) => {
    set(state => ({
      tagManifestLayers: {
        ...state.tagManifestLayers,
        [tag]: layer,
      },
    }));
  },
}));
