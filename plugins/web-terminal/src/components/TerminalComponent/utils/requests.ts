const NAMESPACE = 'openshift-terminal';
const WORKSPACE_ENDPOINT = `apis/workspace.devfile.io/v1alpha2/namespaces/${NAMESPACE}/devworkspaces`;

const workspace = {
  apiVersion: 'workspace.devfile.io/v1alpha2',
  kind: 'DevWorkspace',
  metadata: {
    generateName: 'web-terminal-',
    namespace: NAMESPACE,
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
export const createWorkspace = async (link: string, token: string) => {
  const response = await fetch(`https://${link}/${WORKSPACE_ENDPOINT}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workspace),
  });
  const data = await response.json();
  return data.metadata.name;
};

export const getWorkspace = async (
  link: string,
  token: string,
  name: string,
) => {
  const response = await fetch(
    `https://${link}/${WORKSPACE_ENDPOINT}/${name}`,
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
