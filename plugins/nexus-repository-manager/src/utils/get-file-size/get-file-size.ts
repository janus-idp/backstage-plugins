import { ComponentXO, RawAsset } from '../../types';

export function getFileSize({
  component,
  rawAssets,
}: {
  component: ComponentXO;
  rawAssets: (RawAsset | null)[];
}) {
  const componentsSize =
    component.assets?.reduce((acc, asset) => {
      return acc + (asset.fileSize ?? 0);
    }, 0) ?? 0;

  const rawAssetsSize = rawAssets.reduce((acc, rawAsset) => {
    if (!rawAsset) {
      return acc;
    }

    if (rawAsset.schemaVersion === 1) {
      return acc;
    }

    const layerSize = rawAsset.layers.reduce((layerAcc, layer) => {
      return layerAcc + layer.size;
    }, 0);

    return acc + rawAsset.config.size + layerSize;
  }, 0);

  return componentsSize + rawAssetsSize;
}
