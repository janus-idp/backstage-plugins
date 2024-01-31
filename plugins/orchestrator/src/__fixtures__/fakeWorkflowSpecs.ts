import { WorkflowSpecFile } from '@janus-idp/backstage-plugin-orchestrator-common';

export const fakeWorkflowSpecs: WorkflowSpecFile[] = [
  {
    path: '/tmp/orchestrator/repository/workflows/specs/actions-openapi.json',
    content: {
      openapi: '3.0.1',
      info: {
        title: 'Workflow Actions for BS API',
        description: 'Workflow Actions BS API',
        version: '0.0.1',
      },
      servers: [
        {
          url: 'http://host.docker.internal:7007/api/orchestrator',
        },
      ],
      paths: {
        '/actions/fetch:plain': {
          post: {
            operationId: 'fetch:plain',
            description:
              'Downloads content and places it in the workspace, or optionally in a subdirectory specified by the `targetPath` input option.',
            requestBody: {
              description: 'Input parameters for the action fetch:plain in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/fetch_plain',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action fetch:plain response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/fetch:plain:file': {
          post: {
            operationId: 'fetch:plain:file',
            description:
              'Downloads single file and places it in the workspace.',
            requestBody: {
              description:
                'Input parameters for the action fetch:plain:file in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/fetch_plain_file',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action fetch:plain:file response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/fetch:template': {
          post: {
            operationId: 'fetch:template',
            description:
              'Downloads a skeleton, templates variables into file and directory names and content, and places the result in the workspace, or optionally in a subdirectory specified by the `targetPath` input option.',
            requestBody: {
              description:
                'Input parameters for the action fetch:template in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/fetch_template',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action fetch:template response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/publish:gerrit': {
          post: {
            operationId: 'publish:gerrit',
            description:
              'Initializes a git repository of the content in the workspace, and publishes it to Gerrit.',
            requestBody: {
              description:
                'Input parameters for the action publish:gerrit in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/publish_gerrit',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action publish:gerrit response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/publish:gerrit:review': {
          post: {
            operationId: 'publish:gerrit:review',
            description: 'Creates a new Gerrit review.',
            requestBody: {
              description:
                'Input parameters for the action publish:gerrit:review in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/publish_gerrit_review',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action publish:gerrit:review response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/publish:github': {
          post: {
            operationId: 'publish:github',
            description:
              'Initializes a git repository of contents in workspace and publishes it to GitHub.',
            requestBody: {
              description:
                'Input parameters for the action publish:github in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/publish_github',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action publish:github response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/publish:github:pull-request': {
          post: {
            operationId: 'publish:github:pull-request',
            requestBody: {
              description:
                'Input parameters for the action publish:github:pull-request in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/publish_github_pull-request',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action publish:github:pull-request response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/publish:gitlab': {
          post: {
            operationId: 'publish:gitlab',
            description:
              'Initializes a git repository of the content in the workspace, and publishes it to GitLab.',
            requestBody: {
              description:
                'Input parameters for the action publish:gitlab in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/publish_gitlab',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action publish:gitlab response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/publish:gitlab:merge-request': {
          post: {
            operationId: 'publish:gitlab:merge-request',
            requestBody: {
              description:
                'Input parameters for the action publish:gitlab:merge-request in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/publish_gitlab_merge-request',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action publish:gitlab:merge-request response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/publish:bitbucket': {
          post: {
            operationId: 'publish:bitbucket',
            description:
              'Initializes a git repository of the content in the workspace, and publishes it to Bitbucket.',
            requestBody: {
              description:
                'Input parameters for the action publish:bitbucket in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/publish_bitbucket',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action publish:bitbucket response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/publish:bitbucketCloud': {
          post: {
            operationId: 'publish:bitbucketCloud',
            description:
              'Initializes a git repository of the content in the workspace, and publishes it to Bitbucket Cloud.',
            requestBody: {
              description:
                'Input parameters for the action publish:bitbucketCloud in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/publish_bitbucketCloud',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action publish:bitbucketCloud response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/publish:bitbucketServer': {
          post: {
            operationId: 'publish:bitbucketServer',
            description:
              'Initializes a git repository of the content in the workspace, and publishes it to Bitbucket Server.',
            requestBody: {
              description:
                'Input parameters for the action publish:bitbucketServer in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/publish_bitbucketServer',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action publish:bitbucketServer response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/publish:bitbucketServer:pull-request': {
          post: {
            operationId: 'publish:bitbucketServer:pull-request',
            requestBody: {
              description:
                'Input parameters for the action publish:bitbucketServer:pull-request in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/publish_bitbucketServer_pull-request',
                  },
                },
              },
            },
            responses: {
              default: {
                description:
                  'Action publish:bitbucketServer:pull-request response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/publish:azure': {
          post: {
            operationId: 'publish:azure',
            description:
              'Initializes a git repository of the content in the workspace, and publishes it to Azure.',
            requestBody: {
              description:
                'Input parameters for the action publish:azure in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/publish_azure',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action publish:azure response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/debug:log': {
          post: {
            operationId: 'debug:log',
            description:
              'Writes a message into the log or lists all files in the workspace.',
            requestBody: {
              description: 'Input parameters for the action debug:log in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/debug_log',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action debug:log response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/debug:wait': {
          post: {
            operationId: 'debug:wait',
            description: 'Waits for a certain period of time.',
            requestBody: {
              description: 'Input parameters for the action debug:wait in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/debug_wait',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action debug:wait response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/catalog:register': {
          post: {
            operationId: 'catalog:register',
            description:
              'Registers entities from a catalog descriptor file in the workspace into the software catalog.',
            requestBody: {
              description:
                'Input parameters for the action catalog:register in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/catalog_register',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action catalog:register response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/catalog:fetch': {
          post: {
            operationId: 'catalog:fetch',
            description:
              'Returns entity or entities from the catalog by entity reference(s)',
            requestBody: {
              description:
                'Input parameters for the action catalog:fetch in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/catalog_fetch',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action catalog:fetch response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/catalog:write': {
          post: {
            operationId: 'catalog:write',
            description: 'Writes the catalog-info.yaml for your template',
            requestBody: {
              description:
                'Input parameters for the action catalog:write in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/catalog_write',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action catalog:write response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/fs:delete': {
          post: {
            operationId: 'fs:delete',
            description: 'Deletes files and directories from the workspace',
            requestBody: {
              description: 'Input parameters for the action fs:delete in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/fs_delete',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action fs:delete response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/fs:rename': {
          post: {
            operationId: 'fs:rename',
            description: 'Renames files and directories within the workspace',
            requestBody: {
              description: 'Input parameters for the action fs:rename in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/fs_rename',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action fs:rename response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/github:actions:dispatch': {
          post: {
            operationId: 'github:actions:dispatch',
            description:
              'Dispatches a GitHub Action workflow for a given branch or tag',
            requestBody: {
              description:
                'Input parameters for the action github:actions:dispatch in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/github_actions_dispatch',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action github:actions:dispatch response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/github:webhook': {
          post: {
            operationId: 'github:webhook',
            description: 'Creates webhook for a repository on GitHub.',
            requestBody: {
              description:
                'Input parameters for the action github:webhook in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/github_webhook',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action github:webhook response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/github:issues:label': {
          post: {
            operationId: 'github:issues:label',
            description: 'Adds labels to a pull request or issue on GitHub.',
            requestBody: {
              description:
                'Input parameters for the action github:issues:label in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/github_issues_label',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action github:issues:label response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/github:repo:create': {
          post: {
            operationId: 'github:repo:create',
            description: 'Creates a GitHub repository.',
            requestBody: {
              description:
                'Input parameters for the action github:repo:create in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/github_repo_create',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action github:repo:create response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/github:repo:push': {
          post: {
            operationId: 'github:repo:push',
            description:
              'Initializes a git repository of contents in workspace and publishes it to GitHub.',
            requestBody: {
              description:
                'Input parameters for the action github:repo:push in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/github_repo_push',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action github:repo:push response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/github:environment:create': {
          post: {
            operationId: 'github:environment:create',
            description: 'Creates Deployment Environments',
            requestBody: {
              description:
                'Input parameters for the action github:environment:create in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/github_environment_create',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action github:environment:create response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/github:deployKey:create': {
          post: {
            operationId: 'github:deployKey:create',
            description: 'Creates and stores Deploy Keys',
            requestBody: {
              description:
                'Input parameters for the action github:deployKey:create in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/github_deployKey_create',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action github:deployKey:create response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
        '/actions/confluence:transform:markdown': {
          post: {
            operationId: 'confluence:transform:markdown',
            requestBody: {
              description:
                'Input parameters for the action confluence:transform:markdown in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/confluence_transform_markdown',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Action confluence:transform:markdown response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          fetch_plain: {
            type: 'object',
            required: ['url'],
            properties: {
              url: {
                title: 'Fetch URL',
                description:
                  'Relative path or absolute URL pointing to the directory tree to fetch',
                type: 'string',
              },
              targetPath: {
                title: 'Target Path',
                description:
                  'Target path within the working directory to download the contents to.',
                type: 'string',
              },
            },
          },
          fetch_plain_file: {
            type: 'object',
            required: ['url', 'targetPath'],
            properties: {
              url: {
                title: 'Fetch URL',
                description:
                  'Relative path or absolute URL pointing to the single file to fetch.',
                type: 'string',
              },
              targetPath: {
                title: 'Target Path',
                description:
                  'Target path within the working directory to download the file as.',
                type: 'string',
              },
            },
          },
          fetch_template: {
            type: 'object',
            required: ['url'],
            properties: {
              url: {
                title: 'Fetch URL',
                description:
                  'Relative path or absolute URL pointing to the directory tree to fetch',
                type: 'string',
              },
              targetPath: {
                title: 'Target Path',
                description:
                  'Target path within the working directory to download the contents to. Defaults to the working directory root.',
                type: 'string',
              },
              values: {
                title: 'Template Values',
                description: 'Values to pass on to the templating engine',
                type: 'object',
              },
              copyWithoutRender: {
                title: '[Deprecated] Copy Without Render',
                description:
                  'An array of glob patterns. Any files or directories which match are copied without being processed as templates.',
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              copyWithoutTemplating: {
                title: 'Copy Without Templating',
                description:
                  'An array of glob patterns. Contents of matched files or directories are copied without being processed, but paths are subject to rendering.',
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              cookiecutterCompat: {
                title: 'Cookiecutter compatibility mode',
                description:
                  'Enable features to maximise compatibility with templates built for fetch:cookiecutter',
                type: 'boolean',
              },
              templateFileExtension: {
                title: 'Template File Extension',
                description:
                  'If set, only files with the given extension will be templated. If set to `true`, the default extension `.njk` is used.',
                type: 'boolean',
              },
              replace: {
                title: 'Replace files',
                description:
                  'If set, replace files in targetPath instead of skipping existing ones.',
                type: 'boolean',
              },
            },
          },
          publish_gerrit: {
            type: 'object',
            required: ['repoUrl'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                type: 'string',
              },
              description: {
                title: 'Repository Description',
                type: 'string',
              },
              defaultBranch: {
                title: 'Default Branch',
                type: 'string',
                description:
                  "Sets the default branch on the repository. The default value is 'master'",
              },
              gitCommitMessage: {
                title: 'Git Commit Message',
                type: 'string',
                description:
                  "Sets the commit message on the repository. The default value is 'initial commit'",
              },
              gitAuthorName: {
                title: 'Default Author Name',
                type: 'string',
                description:
                  "Sets the default author name for the commit. The default value is 'Scaffolder'",
              },
              gitAuthorEmail: {
                title: 'Default Author Email',
                type: 'string',
                description: 'Sets the default author email for the commit.',
              },
              sourcePath: {
                title: 'Source Path',
                type: 'string',
                description:
                  'Path within the workspace that will be used as the repository root. If omitted, the entire workspace will be published as the repository.',
              },
            },
          },
          publish_gerrit_review: {
            type: 'object',
            required: ['repoUrl', 'gitCommitMessage'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                type: 'string',
              },
              branch: {
                title: 'Repository branch',
                type: 'string',
                description:
                  'Branch of the repository the review will be created on',
              },
              sourcePath: {
                type: 'string',
                title: 'Working Subdirectory',
                description:
                  'Subdirectory of working directory containing the repository',
              },
              gitCommitMessage: {
                title: 'Git Commit Message',
                type: 'string',
                description: 'Sets the commit message on the repository.',
              },
              gitAuthorName: {
                title: 'Default Author Name',
                type: 'string',
                description:
                  "Sets the default author name for the commit. The default value is 'Scaffolder'",
              },
              gitAuthorEmail: {
                title: 'Default Author Email',
                type: 'string',
                description: 'Sets the default author email for the commit.',
              },
            },
          },
          publish_github: {
            type: 'object',
            required: ['repoUrl'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                description:
                  "Accepts the format 'github.com?repo=reponame&owner=owner' where 'reponame' is the new repository name and 'owner' is an organization or username",
                type: 'string',
              },
              description: {
                title: 'Repository Description',
                type: 'string',
              },
              homepage: {
                title: 'Repository Homepage',
                type: 'string',
              },
              access: {
                title: 'Repository Access',
                description:
                  "Sets an admin collaborator on the repository. Can either be a user reference different from 'owner' in 'repoUrl' or team reference, eg. 'org/team-name'",
                type: 'string',
              },
              bypassPullRequestAllowances: {
                title: 'Bypass pull request requirements',
                description:
                  'Allow specific users, teams, or apps to bypass pull request requirements.',
                type: 'object',
                additionalProperties: false,
                properties: {
                  apps: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  users: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  teams: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                },
              },
              requiredApprovingReviewCount: {
                title: 'Required approving review count',
                type: 'number',
                description:
                  'Specify the number of reviewers required to approve pull requests. Use a number between 1 and 6 or 0 to not require reviewers. Defaults to 1.',
              },
              restrictions: {
                title: 'Restrict who can push to the protected branch',
                description:
                  'Restrict who can push to the protected branch. User, app, and team restrictions are only available for organization-owned repositories.',
                type: 'object',
                additionalProperties: false,
                properties: {
                  apps: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  users: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  teams: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                },
              },
              requireCodeOwnerReviews: {
                title: 'Require CODEOWNER Reviews?',
                description:
                  'Require an approved review in PR including files with a designated Code Owner',
                type: 'boolean',
              },
              dismissStaleReviews: {
                title: 'Dismiss Stale Reviews',
                description:
                  'New reviewable commits pushed to a matching branch will dismiss pull request review approvals.',
                type: 'boolean',
              },
              requiredStatusCheckContexts: {
                title: 'Required Status Check Contexts',
                description:
                  'The list of status checks to require in order to merge into this branch',
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              requireBranchesToBeUpToDate: {
                title: 'Require Branches To Be Up To Date?',
                description:
                  "Require branches to be up to date before merging. The default value is 'true'",
                type: 'boolean',
              },
              requiredConversationResolution: {
                title: 'Required Conversation Resolution',
                description:
                  'Requires all conversations on code to be resolved before a pull request can be merged into this branch',
                type: 'boolean',
              },
              repoVisibility: {
                title: 'Repository Visibility',
                type: 'string',
                enum: ['private', 'public', 'internal'],
              },
              defaultBranch: {
                title: 'Default Branch',
                type: 'string',
                description:
                  "Sets the default branch on the repository. The default value is 'master'",
              },
              protectDefaultBranch: {
                title: 'Protect Default Branch',
                type: 'boolean',
                description:
                  "Protect the default branch after creating the repository. The default value is 'true'",
              },
              protectEnforceAdmins: {
                title: 'Enforce Admins On Protected Branches',
                type: 'boolean',
                description:
                  "Enforce admins to adhere to default branch protection. The default value is 'true'",
              },
              deleteBranchOnMerge: {
                title: 'Delete Branch On Merge',
                type: 'boolean',
                description:
                  "Delete the branch after merging the PR. The default value is 'false'",
              },
              gitCommitMessage: {
                title: 'Git Commit Message',
                type: 'string',
                description:
                  "Sets the commit message on the repository. The default value is 'initial commit'",
              },
              gitAuthorName: {
                title: 'Default Author Name',
                type: 'string',
                description:
                  "Sets the default author name for the commit. The default value is 'Scaffolder'",
              },
              gitAuthorEmail: {
                title: 'Default Author Email',
                type: 'string',
                description: 'Sets the default author email for the commit.',
              },
              allowMergeCommit: {
                title: 'Allow Merge Commits',
                type: 'boolean',
                description: "Allow merge commits. The default value is 'true'",
              },
              allowSquashMerge: {
                title: 'Allow Squash Merges',
                type: 'boolean',
                description: "Allow squash merges. The default value is 'true'",
              },
              squashMergeCommitTitle: {
                title: 'Default squash merge commit title',
                enum: ['PR_TITLE', 'COMMIT_OR_PR_TITLE'],
                description:
                  "Sets the default value for a squash merge commit title. The default value is 'COMMIT_OR_PR_TITLE'",
              },
              squashMergeCommitMessage: {
                title: 'Default squash merge commit message',
                enum: ['PR_BODY', 'COMMIT_MESSAGES', 'BLANK'],
                description:
                  "Sets the default value for a squash merge commit message. The default value is 'COMMIT_MESSAGES'",
              },
              allowRebaseMerge: {
                title: 'Allow Rebase Merges',
                type: 'boolean',
                description: "Allow rebase merges. The default value is 'true'",
              },
              allowAutoMerge: {
                title: 'Allow Auto Merges',
                type: 'boolean',
                description:
                  "Allow individual PRs to merge automatically when all merge requirements are met. The default value is 'false'",
              },
              sourcePath: {
                title: 'Source Path',
                description:
                  'Path within the workspace that will be used as the repository root. If omitted, the entire workspace will be published as the repository.',
                type: 'string',
              },
              collaborators: {
                title: 'Collaborators',
                description:
                  'Provide additional users or teams with permissions',
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['access'],
                  properties: {
                    access: {
                      type: 'string',
                      description: 'The type of access for the user',
                    },
                    user: {
                      type: 'string',
                      description:
                        'The name of the user that will be added as a collaborator',
                    },
                    team: {
                      type: 'string',
                      description:
                        'The name of the team that will be added as a collaborator',
                    },
                  },
                },
              },
              hasProjects: {
                title: 'Enable projects',
                type: 'boolean',
                description:
                  "Enable projects for the repository. The default value is 'true' unless the organization has disabled repository projects",
              },
              hasWiki: {
                title: 'Enable the wiki',
                type: 'boolean',
                description:
                  "Enable the wiki for the repository. The default value is 'true'",
              },
              hasIssues: {
                title: 'Enable issues',
                type: 'boolean',
                description:
                  "Enable issues for the repository. The default value is 'true'",
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description: 'The token to use for authorization to GitHub',
              },
              topics: {
                title: 'Topics',
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              repoVariables: {
                title: 'Repository Variables',
                description: 'Variables attached to the repository',
                type: 'object',
              },
              secrets: {
                title: 'Repository Secrets',
                description: 'Secrets attached to the repository',
                type: 'object',
              },
              requiredCommitSigning: {
                title: 'Require commit signing',
                type: 'boolean',
                description:
                  'Require commit signing so that you must sign commits on this branch.',
              },
            },
          },
          'publish_github_pull-request': {
            required: ['repoUrl', 'title', 'description', 'branchName'],
            type: 'object',
            properties: {
              repoUrl: {
                title: 'Repository Location',
                description:
                  "Accepts the format 'github.com?repo=reponame&owner=owner' where 'reponame' is the repository name and 'owner' is an organization or username",
                type: 'string',
              },
              branchName: {
                type: 'string',
                title: 'Branch Name',
                description: 'The name for the branch',
              },
              targetBranchName: {
                type: 'string',
                title: 'Target Branch Name',
                description: 'The target branch name of the merge request',
              },
              title: {
                type: 'string',
                title: 'Pull Request Name',
                description: 'The name for the pull request',
              },
              description: {
                type: 'string',
                title: 'Pull Request Description',
                description: 'The description of the pull request',
              },
              draft: {
                type: 'boolean',
                title: 'Create as Draft',
                description: 'Create a draft pull request',
              },
              sourcePath: {
                type: 'string',
                title: 'Working Subdirectory',
                description:
                  'Subdirectory of working directory to copy changes from',
              },
              targetPath: {
                type: 'string',
                title: 'Repository Subdirectory',
                description: 'Subdirectory of repository to apply changes to',
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description: 'The token to use for authorization to GitHub',
              },
              reviewers: {
                title: 'Pull Request Reviewers',
                type: 'array',
                items: {
                  type: 'string',
                },
                description:
                  'The users that will be added as reviewers to the pull request',
              },
              teamReviewers: {
                title: 'Pull Request Team Reviewers',
                type: 'array',
                items: {
                  type: 'string',
                },
                description:
                  'The teams that will be added as reviewers to the pull request',
              },
              commitMessage: {
                type: 'string',
                title: 'Commit Message',
                description: 'The commit message for the pull request commit',
              },
            },
          },
          publish_gitlab: {
            type: 'object',
            required: ['repoUrl'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                type: 'string',
                description:
                  "Accepts the format 'gitlab.com?repo=project_name&owner=group_name' where 'project_name' is the repository name and 'group_name' is a group or username",
              },
              repoVisibility: {
                title: 'Repository Visibility',
                type: 'string',
                enum: ['private', 'public', 'internal'],
              },
              defaultBranch: {
                title: 'Default Branch',
                type: 'string',
                description:
                  "Sets the default branch on the repository. The default value is 'master'",
              },
              gitCommitMessage: {
                title: 'Git Commit Message',
                type: 'string',
                description:
                  "Sets the commit message on the repository. The default value is 'initial commit'",
              },
              gitAuthorName: {
                title: 'Default Author Name',
                type: 'string',
                description:
                  "Sets the default author name for the commit. The default value is 'Scaffolder'",
              },
              gitAuthorEmail: {
                title: 'Default Author Email',
                type: 'string',
                description: 'Sets the default author email for the commit.',
              },
              sourcePath: {
                title: 'Source Path',
                description:
                  'Path within the workspace that will be used as the repository root. If omitted, the entire workspace will be published as the repository.',
                type: 'string',
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description: 'The token to use for authorization to GitLab',
              },
              setUserAsOwner: {
                title: 'Set User As Owner',
                type: 'boolean',
                description:
                  'Set the token user as owner of the newly created repository. Requires a token authorized to do the edit in the integration configuration for the matching host',
              },
              topics: {
                title: 'Topic labels',
                description: 'Topic labels to apply on the repository.',
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
          'publish_gitlab_merge-request': {
            required: ['repoUrl', 'branchName'],
            type: 'object',
            properties: {
              repoUrl: {
                type: 'string',
                title: 'Repository Location',
                description:
                  "Accepts the format 'gitlab.com?repo=project_name&owner=group_name' where 'project_name' is the repository name and 'group_name' is a group or username",
              },
              projectid: {
                type: 'string',
                title: 'projectid',
                description: 'Project ID/Name(slug) of the Gitlab Project',
              },
              title: {
                type: 'string',
                title: 'Merge Request Name',
                description: 'The name for the merge request',
              },
              description: {
                type: 'string',
                title: 'Merge Request Description',
                description: 'The description of the merge request',
              },
              branchName: {
                type: 'string',
                title: 'Source Branch Name',
                description: 'The source branch name of the merge request',
              },
              targetBranchName: {
                type: 'string',
                title: 'Target Branch Name',
                description: 'The target branch name of the merge request',
              },
              sourcePath: {
                type: 'string',
                title: 'Working Subdirectory',
                description:
                  'Subdirectory of working directory to copy changes from',
              },
              targetPath: {
                type: 'string',
                title: 'Repository Subdirectory',
                description: 'Subdirectory of repository to apply changes to',
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description: 'The token to use for authorization to GitLab',
              },
              commitAction: {
                title: 'Commit action',
                type: 'string',
                enum: ['create', 'update', 'delete'],
                description:
                  'The action to be used for git commit. Defaults to create.',
              },
              removeSourceBranch: {
                title: 'Delete source branch',
                type: 'boolean',
                description:
                  'Option to delete source branch once the MR has been merged. Default: false',
              },
              assignee: {
                title: 'Merge Request Assignee',
                type: 'string',
                description: 'User this merge request will be assigned to',
              },
            },
          },
          publish_bitbucket: {
            type: 'object',
            required: ['repoUrl'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                type: 'string',
              },
              description: {
                title: 'Repository Description',
                type: 'string',
              },
              repoVisibility: {
                title: 'Repository Visibility',
                type: 'string',
                enum: ['private', 'public'],
              },
              defaultBranch: {
                title: 'Default Branch',
                type: 'string',
                description:
                  "Sets the default branch on the repository. The default value is 'master'",
              },
              sourcePath: {
                title: 'Source Path',
                description:
                  'Path within the workspace that will be used as the repository root. If omitted, the entire workspace will be published as the repository.',
                type: 'string',
              },
              enableLFS: {
                title: 'Enable LFS?',
                description:
                  'Enable LFS for the repository. Only available for hosted Bitbucket.',
                type: 'boolean',
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description: 'The token to use for authorization to BitBucket',
              },
              gitCommitMessage: {
                title: 'Git Commit Message',
                type: 'string',
                description:
                  "Sets the commit message on the repository. The default value is 'initial commit'",
              },
              gitAuthorName: {
                title: 'Default Author Name',
                type: 'string',
                description:
                  "Sets the default author name for the commit. The default value is 'Scaffolder'",
              },
              gitAuthorEmail: {
                title: 'Default Author Email',
                type: 'string',
                description: 'Sets the default author email for the commit.',
              },
            },
          },
          publish_bitbucketCloud: {
            type: 'object',
            required: ['repoUrl'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                type: 'string',
              },
              description: {
                title: 'Repository Description',
                type: 'string',
              },
              repoVisibility: {
                title: 'Repository Visibility',
                type: 'string',
                enum: ['private', 'public'],
              },
              defaultBranch: {
                title: 'Default Branch',
                type: 'string',
                description:
                  "Sets the default branch on the repository. The default value is 'master'",
              },
              sourcePath: {
                title: 'Source Path',
                description:
                  'Path within the workspace that will be used as the repository root. If omitted, the entire workspace will be published as the repository.',
                type: 'string',
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description:
                  'The token to use for authorization to BitBucket Cloud',
              },
            },
          },
          publish_bitbucketServer: {
            type: 'object',
            required: ['repoUrl'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                type: 'string',
              },
              description: {
                title: 'Repository Description',
                type: 'string',
              },
              repoVisibility: {
                title: 'Repository Visibility',
                type: 'string',
                enum: ['private', 'public'],
              },
              defaultBranch: {
                title: 'Default Branch',
                type: 'string',
                description:
                  "Sets the default branch on the repository. The default value is 'master'",
              },
              sourcePath: {
                title: 'Source Path',
                description:
                  'Path within the workspace that will be used as the repository root. If omitted, the entire workspace will be published as the repository.',
                type: 'string',
              },
              enableLFS: {
                title: 'Enable LFS?',
                description: 'Enable LFS for the repository.',
                type: 'boolean',
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description:
                  'The token to use for authorization to BitBucket Server',
              },
              gitCommitMessage: {
                title: 'Git Commit Message',
                type: 'string',
                description:
                  "Sets the commit message on the repository. The default value is 'initial commit'",
              },
              gitAuthorName: {
                title: 'Author Name',
                type: 'string',
                description:
                  "Sets the author name for the commit. The default value is 'Scaffolder'",
              },
              gitAuthorEmail: {
                title: 'Author Email',
                type: 'string',
                description: 'Sets the author email for the commit.',
              },
            },
          },
          'publish_bitbucketServer_pull-request': {
            type: 'object',
            required: ['repoUrl', 'title', 'sourceBranch'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                type: 'string',
              },
              title: {
                title: 'Pull Request title',
                type: 'string',
                description: 'The title for the pull request',
              },
              description: {
                title: 'Pull Request Description',
                type: 'string',
                description: 'The description of the pull request',
              },
              targetBranch: {
                title: 'Target Branch',
                type: 'string',
                description:
                  "Branch of repository to apply changes to. The default value is 'master'",
              },
              sourceBranch: {
                title: 'Source Branch',
                type: 'string',
                description: 'Branch of repository to copy changes from',
              },
              token: {
                title: 'Authorization Token',
                type: 'string',
                description:
                  'The token to use for authorization to BitBucket Server',
              },
            },
          },
          publish_azure: {
            type: 'object',
            required: ['repoUrl'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                type: 'string',
              },
              description: {
                title: 'Repository Description',
                type: 'string',
              },
              defaultBranch: {
                title: 'Default Branch',
                type: 'string',
                description:
                  "Sets the default branch on the repository. The default value is 'master'",
              },
              gitCommitMessage: {
                title: 'Git Commit Message',
                type: 'string',
                description:
                  "Sets the commit message on the repository. The default value is 'initial commit'",
              },
              gitAuthorName: {
                title: 'Default Author Name',
                type: 'string',
                description:
                  "Sets the default author name for the commit. The default value is 'Scaffolder'",
              },
              gitAuthorEmail: {
                title: 'Default Author Email',
                type: 'string',
                description: 'Sets the default author email for the commit.',
              },
              sourcePath: {
                title: 'Source Path',
                description:
                  'Path within the workspace that will be used as the repository root. If omitted, the entire workspace will be published as the repository.',
                type: 'string',
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description: 'The token to use for authorization to Azure',
              },
            },
          },
          debug_log: {
            type: 'object',
            properties: {
              message: {
                title: 'Message to output.',
                type: 'string',
              },
              listWorkspace: {
                title: 'List all files in the workspace, if true.',
                type: 'boolean',
              },
              extra: {
                title: 'Extra info',
              },
            },
          },
          debug_wait: {
            type: 'object',
            properties: {
              minutes: {
                title: 'Waiting period in minutes.',
                type: 'number',
              },
              seconds: {
                title: 'Waiting period in seconds.',
                type: 'number',
              },
              milliseconds: {
                title: 'Waiting period in milliseconds.',
                type: 'number',
              },
            },
          },
          catalog_register: {
            oneOf: [
              {
                type: 'object',
                required: ['catalogInfoUrl'],
                properties: {
                  catalogInfoUrl: {
                    title: 'Catalog Info URL',
                    description:
                      'An absolute URL pointing to the catalog info file location',
                    type: 'string',
                  },
                  optional: {
                    title: 'Optional',
                    description:
                      'Permit the registered location to optionally exist. Default: false',
                    type: 'boolean',
                  },
                },
              },
              {
                type: 'object',
                required: ['repoContentsUrl'],
                properties: {
                  repoContentsUrl: {
                    title: 'Repository Contents URL',
                    description:
                      'An absolute URL pointing to the root of a repository directory tree',
                    type: 'string',
                  },
                  catalogInfoPath: {
                    title: 'Fetch URL',
                    description:
                      'A relative path from the repo root pointing to the catalog info file, defaults to /catalog-info.yaml',
                    type: 'string',
                  },
                  optional: {
                    title: 'Optional',
                    description:
                      'Permit the registered location to optionally exist. Default: false',
                    type: 'boolean',
                  },
                },
              },
            ],
          },
          catalog_fetch: {
            type: 'object',
            properties: {
              entityRef: {
                type: 'string',
                description: 'Entity reference of the entity to get',
              },
              entityRefs: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Entity references of the entities to get',
              },
              optional: {
                type: 'boolean',
                description:
                  'Allow the entity or entities to optionally exist. Default: false',
              },
              defaultKind: {
                type: 'string',
                description: 'The default kind',
              },
              defaultNamespace: {
                type: 'string',
                description: 'The default namespace',
              },
            },
            additionalProperties: false,
          },
          catalog_write: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: 'Defaults to catalog-info.yaml',
              },
              entity: {
                type: 'object',
                additionalProperties: {},
                description:
                  'You can provide the same values used in the Entity schema.',
              },
            },
            required: ['entity'],
            additionalProperties: false,
          },
          fs_delete: {
            required: ['files'],
            type: 'object',
            properties: {
              files: {
                title: 'Files',
                description:
                  'A list of files and directories that will be deleted',
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
          fs_rename: {
            required: ['files'],
            type: 'object',
            properties: {
              files: {
                title: 'Files',
                description:
                  'A list of file and directory names that will be renamed',
                type: 'array',
                items: {
                  type: 'object',
                  required: ['from', 'to'],
                  properties: {
                    from: {
                      type: 'string',
                      title: 'The source location of the file to be renamed',
                    },
                    to: {
                      type: 'string',
                      title: 'The destination of the new file',
                    },
                    overwrite: {
                      type: 'boolean',
                      title:
                        'Overwrite existing file or directory, default is false',
                    },
                  },
                },
              },
            },
          },
          github_actions_dispatch: {
            type: 'object',
            required: ['repoUrl', 'workflowId', 'branchOrTagName'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                description:
                  "Accepts the format 'github.com?repo=reponame&owner=owner' where 'reponame' is the new repository name and 'owner' is an organization or username",
                type: 'string',
              },
              workflowId: {
                title: 'Workflow ID',
                description: 'The GitHub Action Workflow filename',
                type: 'string',
              },
              branchOrTagName: {
                title: 'Branch or Tag name',
                description:
                  'The git branch or tag name used to dispatch the workflow',
                type: 'string',
              },
              workflowInputs: {
                title: 'Workflow Inputs',
                description:
                  'Inputs keys and values to send to GitHub Action configured on the workflow file. The maximum number of properties is 10. ',
                type: 'object',
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description:
                  'The GITHUB_TOKEN to use for authorization to GitHub',
              },
            },
          },
          github_webhook: {
            type: 'object',
            required: ['repoUrl', 'webhookUrl'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                description:
                  "Accepts the format 'github.com?repo=reponame&owner=owner' where 'reponame' is the new repository name and 'owner' is an organization or username",
                type: 'string',
              },
              webhookUrl: {
                title: 'Webhook URL',
                description: 'The URL to which the payloads will be delivered',
                type: 'string',
              },
              webhookSecret: {
                title: 'Webhook Secret',
                description:
                  'Webhook secret value. The default can be provided internally in action creation',
                type: 'string',
              },
              events: {
                title: 'Triggering Events',
                description:
                  'Determines what events the hook is triggered for. Default: push',
                type: 'string',
              },
              active: {
                title: 'Active',
                type: 'boolean',
                description:
                  'Determines if notifications are sent when the webhook is triggered. Default: true',
              },
              contentType: {
                title: 'Content Type',
                type: 'string',
                enum: ['form', 'json'],
                description:
                  "The media type used to serialize the payloads. The default is 'form'",
              },
              insecureSsl: {
                title: 'Insecure SSL',
                type: 'boolean',
                description:
                  "Determines whether the SSL certificate of the host for url will be verified when delivering payloads. Default 'false'",
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description:
                  'The GITHUB_TOKEN to use for authorization to GitHub',
              },
            },
          },
          github_issues_label: {
            type: 'object',
            required: ['repoUrl', 'number', 'labels'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                description:
                  "Accepts the format 'github.com?repo=reponame&owner=owner' where 'reponame' is the repository name and 'owner' is an organization or username",
                type: 'string',
              },
              number: {
                title: 'Pull Request or issue number',
                description:
                  'The pull request or issue number to add labels to',
                type: 'number',
              },
              labels: {
                title: 'Labels',
                description: 'The labels to add to the pull request or issue',
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description:
                  'The GITHUB_TOKEN to use for authorization to GitHub',
              },
            },
          },
          github_repo_create: {
            type: 'object',
            required: ['repoUrl'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                description:
                  "Accepts the format 'github.com?repo=reponame&owner=owner' where 'reponame' is the new repository name and 'owner' is an organization or username",
                type: 'string',
              },
              description: {
                title: 'Repository Description',
                type: 'string',
              },
              homepage: {
                title: 'Repository Homepage',
                type: 'string',
              },
              access: {
                title: 'Repository Access',
                description:
                  "Sets an admin collaborator on the repository. Can either be a user reference different from 'owner' in 'repoUrl' or team reference, eg. 'org/team-name'",
                type: 'string',
              },
              requireCodeOwnerReviews: {
                title: 'Require CODEOWNER Reviews?',
                description:
                  'Require an approved review in PR including files with a designated Code Owner',
                type: 'boolean',
              },
              bypassPullRequestAllowances: {
                title: 'Bypass pull request requirements',
                description:
                  'Allow specific users, teams, or apps to bypass pull request requirements.',
                type: 'object',
                additionalProperties: false,
                properties: {
                  apps: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  users: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  teams: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                },
              },
              requiredApprovingReviewCount: {
                title: 'Required approving review count',
                type: 'number',
                description:
                  'Specify the number of reviewers required to approve pull requests. Use a number between 1 and 6 or 0 to not require reviewers. Defaults to 1.',
              },
              restrictions: {
                title: 'Restrict who can push to the protected branch',
                description:
                  'Restrict who can push to the protected branch. User, app, and team restrictions are only available for organization-owned repositories.',
                type: 'object',
                additionalProperties: false,
                properties: {
                  apps: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  users: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  teams: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                },
              },
              requiredStatusCheckContexts: {
                title: 'Required Status Check Contexts',
                description:
                  'The list of status checks to require in order to merge into this branch',
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              requireBranchesToBeUpToDate: {
                title: 'Require Branches To Be Up To Date?',
                description:
                  "Require branches to be up to date before merging. The default value is 'true'",
                type: 'boolean',
              },
              requiredConversationResolution: {
                title: 'Required Conversation Resolution',
                description:
                  'Requires all conversations on code to be resolved before a pull request can be merged into this branch',
                type: 'boolean',
              },
              repoVisibility: {
                title: 'Repository Visibility',
                type: 'string',
                enum: ['private', 'public', 'internal'],
              },
              deleteBranchOnMerge: {
                title: 'Delete Branch On Merge',
                type: 'boolean',
                description:
                  "Delete the branch after merging the PR. The default value is 'false'",
              },
              allowMergeCommit: {
                title: 'Allow Merge Commits',
                type: 'boolean',
                description: "Allow merge commits. The default value is 'true'",
              },
              allowSquashMerge: {
                title: 'Allow Squash Merges',
                type: 'boolean',
                description: "Allow squash merges. The default value is 'true'",
              },
              squashMergeCommitTitle: {
                title: 'Default squash merge commit title',
                enum: ['PR_TITLE', 'COMMIT_OR_PR_TITLE'],
                description:
                  "Sets the default value for a squash merge commit title. The default value is 'COMMIT_OR_PR_TITLE'",
              },
              squashMergeCommitMessage: {
                title: 'Default squash merge commit message',
                enum: ['PR_BODY', 'COMMIT_MESSAGES', 'BLANK'],
                description:
                  "Sets the default value for a squash merge commit message. The default value is 'COMMIT_MESSAGES'",
              },
              allowRebaseMerge: {
                title: 'Allow Rebase Merges',
                type: 'boolean',
                description: "Allow rebase merges. The default value is 'true'",
              },
              allowAutoMerge: {
                title: 'Allow Auto Merges',
                type: 'boolean',
                description:
                  "Allow individual PRs to merge automatically when all merge requirements are met. The default value is 'false'",
              },
              collaborators: {
                title: 'Collaborators',
                description:
                  'Provide additional users or teams with permissions',
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['access'],
                  properties: {
                    access: {
                      type: 'string',
                      description: 'The type of access for the user',
                    },
                    user: {
                      type: 'string',
                      description:
                        'The name of the user that will be added as a collaborator',
                    },
                    team: {
                      type: 'string',
                      description:
                        'The name of the team that will be added as a collaborator',
                    },
                  },
                },
              },
              hasProjects: {
                title: 'Enable projects',
                type: 'boolean',
                description:
                  "Enable projects for the repository. The default value is 'true' unless the organization has disabled repository projects",
              },
              hasWiki: {
                title: 'Enable the wiki',
                type: 'boolean',
                description:
                  "Enable the wiki for the repository. The default value is 'true'",
              },
              hasIssues: {
                title: 'Enable issues',
                type: 'boolean',
                description:
                  "Enable issues for the repository. The default value is 'true'",
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description: 'The token to use for authorization to GitHub',
              },
              topics: {
                title: 'Topics',
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              repoVariables: {
                title: 'Repository Variables',
                description: 'Variables attached to the repository',
                type: 'object',
              },
              secrets: {
                title: 'Repository Secrets',
                description: 'Secrets attached to the repository',
                type: 'object',
              },
              requiredCommitSigning: {
                title: 'Require commit signing',
                type: 'boolean',
                description:
                  'Require commit signing so that you must sign commits on this branch.',
              },
            },
          },
          github_repo_push: {
            type: 'object',
            required: ['repoUrl'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                description:
                  "Accepts the format 'github.com?repo=reponame&owner=owner' where 'reponame' is the new repository name and 'owner' is an organization or username",
                type: 'string',
              },
              requireCodeOwnerReviews: {
                title: 'Require CODEOWNER Reviews?',
                description:
                  'Require an approved review in PR including files with a designated Code Owner',
                type: 'boolean',
              },
              dismissStaleReviews: {
                title: 'Dismiss Stale Reviews',
                description:
                  'New reviewable commits pushed to a matching branch will dismiss pull request review approvals.',
                type: 'boolean',
              },
              requiredStatusCheckContexts: {
                title: 'Required Status Check Contexts',
                description:
                  'The list of status checks to require in order to merge into this branch',
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              bypassPullRequestAllowances: {
                title: 'Bypass pull request requirements',
                description:
                  'Allow specific users, teams, or apps to bypass pull request requirements.',
                type: 'object',
                additionalProperties: false,
                properties: {
                  apps: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  users: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  teams: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                },
              },
              requiredApprovingReviewCount: {
                title: 'Required approving review count',
                type: 'number',
                description:
                  'Specify the number of reviewers required to approve pull requests. Use a number between 1 and 6 or 0 to not require reviewers. Defaults to 1.',
              },
              restrictions: {
                title: 'Restrict who can push to the protected branch',
                description:
                  'Restrict who can push to the protected branch. User, app, and team restrictions are only available for organization-owned repositories.',
                type: 'object',
                additionalProperties: false,
                properties: {
                  apps: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  users: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  teams: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                },
              },
              requireBranchesToBeUpToDate: {
                title: 'Require Branches To Be Up To Date?',
                description:
                  "Require branches to be up to date before merging. The default value is 'true'",
                type: 'boolean',
              },
              requiredConversationResolution: {
                title: 'Required Conversation Resolution',
                description:
                  'Requires all conversations on code to be resolved before a pull request can be merged into this branch',
                type: 'boolean',
              },
              defaultBranch: {
                title: 'Default Branch',
                type: 'string',
                description:
                  "Sets the default branch on the repository. The default value is 'master'",
              },
              protectDefaultBranch: {
                title: 'Protect Default Branch',
                type: 'boolean',
                description:
                  "Protect the default branch after creating the repository. The default value is 'true'",
              },
              protectEnforceAdmins: {
                title: 'Enforce Admins On Protected Branches',
                type: 'boolean',
                description:
                  "Enforce admins to adhere to default branch protection. The default value is 'true'",
              },
              gitCommitMessage: {
                title: 'Git Commit Message',
                type: 'string',
                description:
                  "Sets the commit message on the repository. The default value is 'initial commit'",
              },
              gitAuthorName: {
                title: 'Default Author Name',
                type: 'string',
                description:
                  "Sets the default author name for the commit. The default value is 'Scaffolder'",
              },
              gitAuthorEmail: {
                title: 'Default Author Email',
                type: 'string',
                description: 'Sets the default author email for the commit.',
              },
              sourcePath: {
                title: 'Source Path',
                description:
                  'Path within the workspace that will be used as the repository root. If omitted, the entire workspace will be published as the repository.',
                type: 'string',
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description: 'The token to use for authorization to GitHub',
              },
              requiredCommitSigning: {
                title: 'Require commit signing',
                type: 'boolean',
                description:
                  'Require commit signing so that you must sign commits on this branch.',
              },
            },
          },
          github_environment_create: {
            type: 'object',
            required: ['repoUrl', 'name'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                description:
                  "Accepts the format 'github.com?repo=reponame&owner=owner' where 'reponame' is the new repository name and 'owner' is an organization or username",
                type: 'string',
              },
              name: {
                title: 'Environment Name',
                description: 'Name of the deployment environment to create',
                type: 'string',
              },
              deploymentBranchPolicy: {
                title: 'Deployment Branch Policy',
                description:
                  'The type of deployment branch policy for this environment. To allow all branches to deploy, set to null.',
                type: 'object',
                required: ['protected_branches', 'custom_branch_policies'],
                properties: {
                  protected_branches: {
                    title: 'Protected Branches',
                    description:
                      'Whether only branches with branch protection rules can deploy to this environment. If protected_branches is true, custom_branch_policies must be false; if protected_branches is false, custom_branch_policies must be true.',
                    type: 'boolean',
                  },
                  custom_branch_policies: {
                    title: 'Custom Branch Policies',
                    description:
                      'Whether only branches that match the specified name patterns can deploy to this environment. If custom_branch_policies is true, protected_branches must be false; if custom_branch_policies is false, protected_branches must be true.',
                    type: 'boolean',
                  },
                },
              },
              customBranchPolicyNames: {
                title: 'Custom Branch Policy Name',
                description:
                  'The name pattern that branches must match in order to deploy to the environment.\n\n            Wildcard characters will not match /. For example, to match branches that begin with release/ and contain an additional single slash, use release/*/*. For more information about pattern matching syntax, see the Ruby File.fnmatch documentation.',
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              environmentVariables: {
                title: 'Environment Variables',
                description:
                  'Environment variables attached to the deployment environment',
                type: 'object',
              },
              secrets: {
                title: 'Deployment Secrets',
                description: 'Secrets attached to the deployment environment',
                type: 'object',
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description: 'The token to use for authorization to GitHub',
              },
            },
          },
          github_deployKey_create: {
            type: 'object',
            required: ['repoUrl', 'publicKey', 'privateKey', 'deployKeyName'],
            properties: {
              repoUrl: {
                title: 'Repository Location',
                description:
                  "Accepts the format 'github.com?repo=reponame&owner=owner' where 'reponame' is the new repository name and 'owner' is an organization or username",
                type: 'string',
              },
              publicKey: {
                title: 'SSH Public Key',
                description:
                  "Generated from ssh-keygen.  Begins with 'ssh-rsa', 'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', 'ecdsa-sha2-nistp521', 'ssh-ed25519', 'sk-ecdsa-sha2-nistp256@openssh.com', or 'sk-ssh-ed25519@openssh.com'.",
                type: 'string',
              },
              privateKey: {
                title: 'SSH Private Key',
                description: 'SSH Private Key generated from ssh-keygen',
                type: 'string',
              },
              deployKeyName: {
                title: 'Deploy Key Name',
                description: 'Name of the Deploy Key',
                type: 'string',
              },
              privateKeySecretName: {
                title: 'Private Key GitHub Secret Name',
                description:
                  "Name of the GitHub Secret to store the private key related to the Deploy Key.  Defaults to: 'KEY_NAME_PRIVATE_KEY' where 'KEY_NAME' is the name of the Deploy Key",
                type: 'string',
              },
              token: {
                title: 'Authentication Token',
                type: 'string',
                description: 'The token to use for authorization to GitHub',
              },
            },
          },
          confluence_transform_markdown: {
            properties: {
              confluenceUrls: {
                type: 'array',
                title: 'Confluence URL',
                description:
                  'Paste your Confluence url. Ensure it follows this format: https://{confluence+base+url}/display/{spacekey}/{page+title} or https://{confluence+base+url}/spaces/{spacekey}/pages/1234567/{page+title} for Confluence Cloud',
                items: {
                  type: 'string',
                  default: 'Confluence URL',
                },
              },
              repoUrl: {
                type: 'string',
                title: 'GitHub Repo Url',
                description:
                  'mkdocs.yml file location inside the github repo you want to store the document',
              },
            },
          },
        },
      },
    },
  },
  {
    path: '/tmp/orchestrator/repository/workflows/specs/jira-openapi.json',
    content: {
      openapi: '3.0.1',
      info: {
        title: 'JIRA Actions for BS API',
        description: 'JIRA Actions BS API',
        version: '0.0.1',
      },
      servers: [
        {
          url: 'http://localhost:8080',
        },
      ],
      paths: {
        '/rest/api/2/issue': {
          post: {
            tags: ['Issues'],
            summary: 'Create issue',
            description:
              "Creates an issue or, where the option to create subtasks is enabled in Jira, a subtask. A transition may be applied, to move the issue or subtask to a workflow step other than the default start step, and issue properties set.\n\nThe content of the issue or subtask is defined using `update` and `fields`. The fields that can be set in the issue or subtask are determined using the [ Get create issue metadata](#api-rest-api-3-issue-createmeta-get). These are the same fields that appear on the issue's create screen. Note that the `description`, `environment`, and any `textarea` type custom fields (multi-line text fields) take Atlassian Document Format content. Single line custom fields (`textfield`) accept a string and don't handle Atlassian Document Format content.\n\nCreating a subtask differs from creating an issue as follows:\n\n *  `issueType` must be set to a subtask issue type (use [ Get create issue metadata](#api-rest-api-3-issue-createmeta-get) to find subtask issue types).\n *  `parent` must contain the ID or key of the parent issue.\n\nIn a next-gen project any issue may be made a child providing that the parent and child are members of the same project.\n\n**[Permissions](#permissions) required:** *Browse projects* and *Create issues* [project permissions](https://confluence.atlassian.com/x/yodKLg) for the project in which the issue or subtask is created.",
            operationId: 'createIssue',
            parameters: [
              {
                name: 'updateHistory',
                in: 'query',
                description:
                  "Whether the project in which the issue is created is added to the user's **Recently viewed** project list, as shown under **Projects** in Jira. When provided, the issue type and request type are added to the user's history for a project. These values are then used to provide defaults on the issue create screen.",
                schema: {
                  type: 'boolean',
                  default: false,
                },
              },
            ],
            requestBody: {
              description: 'Input parameters for the action createIssue in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/IssueUpdateDetails',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Create Issue Response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
            deprecated: false,
            security: [
              {
                bearerAuth: [],
              },
            ],
          },
        },
        '/rest/api/2/issue/{issueIdOrKey}/transitions': {
          post: {
            tags: ['Issues'],
            summary: 'Transition issue',
            description:
              'Performs an issue transition and, if the transition has a screen, updates the fields from the transition screen.',
            operationId: 'transitionIssue',
            parameters: [
              {
                name: 'issueIdOrKey',
                in: 'path',
                description: 'The ID or key of the issue.',
                required: true,
                schema: {
                  type: 'string',
                },
              },
            ],
            requestBody: {
              description:
                'Input parameters for the action transitionIssue in BS',
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TransitionIssue',
                  },
                },
              },
            },
            responses: {
              default: {
                description: 'Transition Issue Response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
            deprecated: false,
            security: [
              {
                bearerAuth: [],
              },
            ],
          },
          get: {
            tags: ['Issues'],
            summary: 'Get issue transitions',
            description: 'Get issue transitions',
            operationId: 'getIssueTransitions',
            parameters: [
              {
                name: 'issueIdOrKey',
                in: 'path',
                description: 'The ID or key of the issue.',
                required: true,
                schema: {
                  type: 'string',
                },
              },
            ],
            responses: {
              default: {
                description: 'Transition Issue Response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                    },
                  },
                },
              },
            },
            deprecated: false,
            security: [
              {
                bearerAuth: [],
              },
            ],
          },
        },
      },
      components: {
        securitySchemes: {
          basicAuth: {
            type: 'http',
            scheme: 'basic',
          },
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
          },
        },
        schemas: {
          ErrorCollection: {
            type: 'object',
          },
          IssueUpdateDetails: {
            type: 'object',
            properties: {
              fields: {
                type: 'object',
              },
            },
          },
          TransitionIssue: {
            type: 'object',
            properties: {
              transition: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                  },
                },
              },
              update: {
                type: 'object',
                properties: {
                  comment: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        add: {
                          type: 'object',
                          properties: {
                            body: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          CreatedIssue: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the created issue or subtask.',
                readOnly: true,
              },
              key: {
                type: 'string',
                description: 'The key of the created issue or subtask.',
                readOnly: true,
              },
              self: {
                type: 'string',
                description: 'The URL of the created issue or subtask.',
                readOnly: true,
              },
            },
          },
        },
      },
    },
  },
];
