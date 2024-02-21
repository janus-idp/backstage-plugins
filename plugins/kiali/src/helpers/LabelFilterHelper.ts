export const isGateway = (labels: { [key: string]: string }): boolean => {
  return (
    labels &&
    'istio' in labels &&
    (labels.istio === 'ingressgateway' || labels.istio === 'egressgateway')
  );
};

export const isWaypoint = (labels: { [key: string]: string }): boolean => {
  return (
    labels &&
    'gateway.istio.io/managed' in labels &&
    labels['gateway.istio.io/managed'] === 'istio.io-mesh-controller'
  );
};
