export const isWaypoint = (labels: { [key: string]: string }): boolean => {
  return (
    labels &&
    'gateway.istio.io/managed' in labels &&
    labels['gateway.istio.io/managed'] === 'istio.io-mesh-controller'
  );
};
