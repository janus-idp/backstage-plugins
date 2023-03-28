const WORKSPACE_ENDPOINT = `apis/workspace.devfile.io/v1alpha2/namespaces`;

export const createWorkspace = async (
  restServerUrl: string,
  link: string,
  token: string,
  namespace: string,
) => {
  const workspace = {
    apiVersion: 'workspace.devfile.io/v1alpha2',
    kind: 'DevWorkspace',
    metadata: {
      generateName: 'web-terminal-',
      namespace: namespace,
      labels: {
        'console.openshift.io/terminal': 'true',
      },
      annotations: {
        'controller.devfile.io/restricted-access': 'true',
        'controller.devfile.io/devworkspace-source': 'web-terminal',
      },
    },
    spec: {
      started: true,
      routingClass: 'web-terminal',
      template: {
        components: [
          {
            name: 'web-terminal-tooling',
            plugin: {
              kubernetes: {
                name: 'web-terminal-tooling',
                namespace: 'openshift-operators',
              },
            },
          },
          {
            name: 'web-terminal-exec',
            plugin: {
              kubernetes: {
                name: 'web-terminal-exec',
                namespace: 'openshift-operators',
              },
            },
          },
        ],
      },
    },
  };

  const response = await fetch(
    `${restServerUrl}?url=https://${link}/${WORKSPACE_ENDPOINT}/${namespace}/devworkspaces`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workspace),
    },
  );
  const data = await response.json();
  if (response.status !== 200 && response.status !== 201) {
    throw new Error(data.message);
  }
  return data.metadata.name;
};

export const getWorkspace = async (
  restServerUrl: string,
  link: string,
  token: string,
  name: string,
  namespace: string,
) => {
  const response = await fetch(
    `${restServerUrl}?url=https://${link}/${WORKSPACE_ENDPOINT}/${namespace}/devworkspaces/${name}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json();
  return [data.status.devworkspaceId, data.status.phase];
};

export const getNamespaces = async (
  restServerUrl: string,
  link: string,
  token: string,
) => {
  const response = await fetch(
    `${restServerUrl}?url=https://${link}/api/v1/namespaces`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json();
  if (response.status !== 200) {
    return [];
  }
  return data.items.map((item: any) => item.metadata.name);
};
