import { AssetXO } from '../../types';

export function getSha256(asset: AssetXO | undefined): string {
  if (!asset) {
    return 'N/A';
  }

  // The checksum should be present with a sha256
  if (!asset.checksum || !('sha256' in asset.checksum)) {
    return 'N/A';
  }

  return String(asset.checksum.sha256);
}
