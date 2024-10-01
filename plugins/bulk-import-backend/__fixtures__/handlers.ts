import { rest } from 'msw';

const localHostAndPort = 'localhost:8765';
export const LOCAL_ADDR = `http://${localHostAndPort}`;

export function loadTestFixture(filePathFromFixturesDir: string) {
  return require(`${__dirname}/${filePathFromFixturesDir}`);
}

function normalizeUrlsForTest(filePath: string) {
  return JSON.parse(
    JSON.stringify(loadTestFixture(filePath))
      .replaceAll('HOSTNAME', localHostAndPort)
      .replaceAll('api.github.com', localHostAndPort)
      .replaceAll('github.com', localHostAndPort)
      .replaceAll('https://', 'http://'),
  );
}

export const DEFAULT_TEST_HANDLERS = [
  rest.get(`${LOCAL_ADDR}/app/installations`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        normalizeUrlsForTest(
          'github/app/installations/app-installation-1.json',
        ),
      ]),
    );
  }),

  rest.post(
    `${LOCAL_ADDR}/app/installations/1/access_tokens`,
    (_, res, ctx) => {
      return res(
        ctx.status(201),
        ctx.json(
          normalizeUrlsForTest(
            'github/app/installations/app-installation-1-access-tokens.json',
          ),
        ),
      );
    },
  ),

  rest.get(`${LOCAL_ADDR}/installation/repositories`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(
        normalizeUrlsForTest('github/app/installations/repositories.json'),
      ),
    );
  }),

  rest.get(`${LOCAL_ADDR}/user/orgs`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(normalizeUrlsForTest('github/user/orgs.json')),
    );
  }),

  rest.get(`${LOCAL_ADDR}/orgs/github`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(normalizeUrlsForTest('github/orgs/github.json')),
    );
  }),

  rest.get(`${LOCAL_ADDR}/orgs/octocat`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(normalizeUrlsForTest('github/orgs/octocat.json')),
    );
  }),

  rest.get(`${LOCAL_ADDR}/orgs/my-org-1`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(normalizeUrlsForTest('github/orgs/my-org-1.json')),
    );
  }),

  rest.get(`${LOCAL_ADDR}/orgs/my-org-2`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(normalizeUrlsForTest('github/orgs/my-org-2.json')),
    );
  }),

  rest.get(`${LOCAL_ADDR}/user`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(normalizeUrlsForTest('github/user/user.json')),
    );
  }),

  rest.get(`${LOCAL_ADDR}/user/repos`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(normalizeUrlsForTest('github/user/repos.json')),
    );
  }),

  rest.get(`${LOCAL_ADDR}/orgs/my-ent-org-1/repos`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(normalizeUrlsForTest('github/orgs/repos/my-ent-org-1.json')),
    );
  }),

  rest.get(`${LOCAL_ADDR}/orgs/my-ent-org-2/repos`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(normalizeUrlsForTest('github/orgs/repos/my-ent-org-2.json')),
    );
  }),

  rest.get(`${LOCAL_ADDR}/orgs/my-ent-org--no-repos/repos`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(
        normalizeUrlsForTest('github/orgs/repos/my-ent-org--no-repos.json'),
      ),
    );
  }),

  rest.get(
    `${LOCAL_ADDR}/repos/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-no-import-pr`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          loadTestFixture(
            'github/repos/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-no-import-pr/repo.json',
          ),
        ),
      );
    },
  ),

  rest.get(
    `${LOCAL_ADDR}/repos/my-org-1/my-repo-with-existing-catalog-info-in-default-branch`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          loadTestFixture(
            'github/repos/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/repo.json',
          ),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/repos/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/contributors`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json([loadTestFixture('user/user.json')]),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/repos/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/pulls`,
    (_, res, ctx) => {
      return res(ctx.status(200), ctx.json([]));
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/repos/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/contents/catalog-info.yaml`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          loadTestFixture(
            'github/repos/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/contents/catalog-info.yaml.json',
          ),
        ),
      );
    },
  ),

  rest.get(
    `${LOCAL_ADDR}/repos/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          loadTestFixture(
            'github/repos/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/repo.json',
          ),
        ),
      );
    },
  ),

  rest.get(
    `${LOCAL_ADDR}/repos/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/pulls`,
    (req, res, ctx) => {
      let prs: any;
      const stateQueryParam = req.url.searchParams?.get('state');
      if (stateQueryParam) {
        prs = loadTestFixture(
          `github/repos/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/pulls/${stateQueryParam}.json`,
        );
      }
      return res(ctx.status(200), ctx.json(prs));
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/repos/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/contents/catalog-info.yaml`,
    (_, res, ctx) => {
      return res(ctx.status(404));
    },
  ),

  rest.get(`${LOCAL_ADDR}/repos/my-ent-org-2/A2`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(loadTestFixture('github/repos/my-ent-org-2/A2/repo.json')),
    );
  }),
  rest.get(`${LOCAL_ADDR}/repos/octocat/my-awesome-repo`, (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(
        loadTestFixture('github/repos/octocat/my-awesome-repo/repo.json'),
      ),
    );
  }),
  rest.get(
    `${LOCAL_ADDR}/repos/octocat/my-awesome-repo/pulls`,
    (_, res, ctx) => {
      return res(ctx.status(200), ctx.json([]));
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/repos/octocat/my-awesome-repo/contents/catalog-info.yaml`,
    (_, res, ctx) => {
      return res(ctx.status(404));
    },
  ),
];
