import { rest } from 'msw';

const LOCAL_ADDR = 'http://localhost:5000';

export const handlers = [
  rest.get(
    `${LOCAL_ADDR}/apis/cluster.open-cluster-management.io/v1/managedclusters`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          items: [
            require(
              `${__dirname}/cluster.open-cluster-management.io/managedclusters/local-cluster.json`,
            ),
            require(
              `${__dirname}/cluster.open-cluster-management.io/managedclusters/cluster1.json`,
            ),
            require(
              `${__dirname}/cluster.open-cluster-management.io/managedclusters/offline-cluster.json`,
            ),
          ],
        }),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/internal.open-cluster-management.io/v1beta1/managedclusterinfos`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          items: [
            require(
              `${__dirname}/internal.open-cluster-management.io/managedclusterinfos/local-cluster.json`,
            ),
            require(
              `${__dirname}/internal.open-cluster-management.io/managedclusterinfos/cluster1.json`,
            ),
            require(
              `${__dirname}/internal.open-cluster-management.io/managedclusterinfos/offline-cluster.json`,
            ),
          ],
        }),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/cluster.open-cluster-management.io/v1/managedclusters/local-cluster`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(
            `${__dirname}/cluster.open-cluster-management.io/managedclusters/local-cluster.json`,
          ),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/cluster.open-cluster-management.io/v1/managedclusters/cluster1`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(
            `${__dirname}/cluster.open-cluster-management.io/managedclusters/cluster1.json`,
          ),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/cluster.open-cluster-management.io/v1/managedclusters/offline-cluster`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(
            `${__dirname}/cluster.open-cluster-management.io/managedclusters/offline-cluster.json`,
          ),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/cluster.open-cluster-management.io/v1/managedclusters/non_existent_cluster`,
    (_, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json(
          require(
            `${__dirname}/cluster.open-cluster-management.io/managedclusters/non_existent_cluster.json`,
          ),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/internal.open-cluster-management.io/v1beta1/namespaces/cluster1/managedclusterinfos/cluster1`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(
            `${__dirname}/internal.open-cluster-management.io/managedclusterinfos/cluster1.json`,
          ),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/internal.open-cluster-management.io/v1beta1/namespaces/local-cluster/managedclusterinfos/local-cluster`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(
            `${__dirname}/internal.open-cluster-management.io/managedclusterinfos/local-cluster.json`,
          ),
        ),
      );
    },
  ),
  rest.get(
    `${LOCAL_ADDR}/apis/internal.open-cluster-management.io/v1beta1/namespaces/offline-cluster/managedclusterinfos/offline-cluster`,
    (_, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json(
          require(
            `${__dirname}/internal.open-cluster-management.io/managedclusterinfos/offline-cluster.json`,
          ),
        ),
      );
    },
  ),
];
