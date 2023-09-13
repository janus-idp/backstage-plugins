import {
  MeshCluster,
  OverviewType,
  ServerConfig,
} from '@janus-idp/backstage-plugin-kiali-common';

export const switchType = <T, U, V>(
  type: OverviewType,
  caseApp: T,
  caseService: U,
  caseWorkload: V,
): T | U | V => {
  switch (type) {
    case 'app': {
      return caseApp;
    }
    case 'service': {
      return caseService;
    }
    default: {
      return caseWorkload;
    }
  }
};

export const getHomeCluster = (cfg: ServerConfig): MeshCluster | undefined => {
  return Object.values(cfg.clusters).find(cluster => cluster.isKialiHome);
};
