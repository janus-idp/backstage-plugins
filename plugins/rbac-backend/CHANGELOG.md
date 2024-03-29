## @janus-idp/backstage-plugin-rbac-backend [2.5.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.4.1...@janus-idp/backstage-plugin-rbac-backend@2.5.0) (2024-03-29)


### Features

* **rbac:** load filtered policies before enforcing ([#1387](https://github.com/janus-idp/backstage-plugins/issues/1387)) ([66980ba](https://github.com/janus-idp/backstage-plugins/commit/66980baebd4d8b5b398646bcab1750c0edec715e))



### Dependencies

* **@janus-idp/backstage-plugin-rbac-common:** upgraded to 1.3.1
* **@janus-idp/backstage-plugin-rbac-node:** upgraded to 1.0.4

## @janus-idp/backstage-plugin-rbac-backend [2.4.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.4.0...@janus-idp/backstage-plugin-rbac-backend@2.4.1) (2024-03-19)


### Bug Fixes

* **rbac:** pass token to readUrl for well-known permission endpoint ([#1342](https://github.com/janus-idp/backstage-plugins/issues/1342)) ([36b7c77](https://github.com/janus-idp/backstage-plugins/commit/36b7c7739753bd1cc55d10aa68d41ed7e15162e6))

## @janus-idp/backstage-plugin-rbac-backend [2.4.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.3.5...@janus-idp/backstage-plugin-rbac-backend@2.4.0) (2024-03-14)


### Features

* **rbac:** query the catalog database when building graph ([#1298](https://github.com/janus-idp/backstage-plugins/issues/1298)) ([c2c9e22](https://github.com/janus-idp/backstage-plugins/commit/c2c9e22e90a594e2a44d1683a05d3111c4baa97b))


### Bug Fixes

* **rbac:** remove admin metadata, when all admins removed from config ([#1314](https://github.com/janus-idp/backstage-plugins/issues/1314)) ([cc6555e](https://github.com/janus-idp/backstage-plugins/commit/cc6555ea22a191c9f9f554b1909b67e517deee71))

## @janus-idp/backstage-plugin-rbac-backend [2.3.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.3.4...@janus-idp/backstage-plugin-rbac-backend@2.3.5) (2024-03-07)


### Bug Fixes

* **rbac:** check source before throwing duplicate warning ([#1278](https://github.com/janus-idp/backstage-plugins/issues/1278)) ([a100eef](https://github.com/janus-idp/backstage-plugins/commit/a100eef67983ba73d929864f0b64991de69718d0))

## @janus-idp/backstage-plugin-rbac-backend [2.3.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.3.3...@janus-idp/backstage-plugin-rbac-backend@2.3.4) (2024-03-04)



### Dependencies

* **@janus-idp/backstage-plugin-rbac-node:** upgraded to 1.0.3

## @janus-idp/backstage-plugin-rbac-backend [2.3.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.3.2...@janus-idp/backstage-plugin-rbac-backend@2.3.3) (2024-02-29)


### Documentation

* **rbac:** update to the rbac documentation ([#1268](https://github.com/janus-idp/backstage-plugins/issues/1268)) ([5c7253b](https://github.com/janus-idp/backstage-plugins/commit/5c7253b7d0646433c55f185092648f0816aee88e))

## @janus-idp/backstage-plugin-rbac-backend [2.3.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.3.1...@janus-idp/backstage-plugin-rbac-backend@2.3.2) (2024-02-28)


### Bug Fixes

* **rbac:** improve error handling in retrieving permission metadata. ([#1285](https://github.com/janus-idp/backstage-plugins/issues/1285)) ([77f5f0e](https://github.com/janus-idp/backstage-plugins/commit/77f5f0efaadf1873b68876f11ca633646ce882b9))

## @janus-idp/backstage-plugin-rbac-backend [2.3.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.3.0...@janus-idp/backstage-plugin-rbac-backend@2.3.1) (2024-02-27)



### Dependencies

* **@janus-idp/backstage-plugin-rbac-node:** upgraded to 1.0.2

## @janus-idp/backstage-plugin-rbac-backend [2.3.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.2.4...@janus-idp/backstage-plugin-rbac-backend@2.3.0) (2024-02-21)


### Features

* **rbac:** backend part - store role description to the database  ([#1178](https://github.com/janus-idp/backstage-plugins/issues/1178)) ([ec8b1c2](https://github.com/janus-idp/backstage-plugins/commit/ec8b1c27cce5c36997f84a068dc4cc5cc542f428))


### Bug Fixes

* **rbac:** reduce the catalog calls when build graph ([#1203](https://github.com/janus-idp/backstage-plugins/issues/1203)) ([e63aac2](https://github.com/janus-idp/backstage-plugins/commit/e63aac2a8e7513974a5aabb3ce25c838d6b34dde))



### Dependencies

* **@janus-idp/backstage-plugin-rbac-common:** upgraded to 1.3.0
* **@janus-idp/backstage-plugin-rbac-node:** upgraded to 1.0.1

## @janus-idp/backstage-plugin-rbac-backend [2.2.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.2.3...@janus-idp/backstage-plugin-rbac-backend@2.2.4) (2024-02-20)


### Bug Fixes

* **rbac:** drop database disabled mode ([#1214](https://github.com/janus-idp/backstage-plugins/issues/1214)) ([b18d80d](https://github.com/janus-idp/backstage-plugins/commit/b18d80dd14e6b7f4f9c90d72ec418609ff1f6a67))

## @janus-idp/backstage-plugin-rbac-backend [2.2.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.2.2...@janus-idp/backstage-plugin-rbac-backend@2.2.3) (2024-02-14)


### Bug Fixes

* **rbac:** allow for super users to have allow all access ([#1208](https://github.com/janus-idp/backstage-plugins/issues/1208)) ([c02a4b0](https://github.com/janus-idp/backstage-plugins/commit/c02a4b029a800b1bcf1f2e2722185faae1e5837e))

## @janus-idp/backstage-plugin-rbac-backend [2.2.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.2.1...@janus-idp/backstage-plugin-rbac-backend@2.2.2) (2024-02-13)


### Bug Fixes

* **rbac:** display resource typed permissions by name too ([#1197](https://github.com/janus-idp/backstage-plugins/issues/1197)) ([bc4e8e7](https://github.com/janus-idp/backstage-plugins/commit/bc4e8e783b1acd8088a45ffed4d902fd9515c2e8))

## @janus-idp/backstage-plugin-rbac-backend [2.2.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.2.0...@janus-idp/backstage-plugin-rbac-backend@2.2.1) (2024-02-12)


### Bug Fixes

* **rbac:** csv updates no longer require server restarts ([#1171](https://github.com/janus-idp/backstage-plugins/issues/1171)) ([ed6fe65](https://github.com/janus-idp/backstage-plugins/commit/ed6fe65d99a2c2facf832a84d29dabc8d339e328))

## @janus-idp/backstage-plugin-rbac-backend [2.2.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.1.3...@janus-idp/backstage-plugin-rbac-backend@2.2.0) (2024-02-08)


### Features

* add support for the new backend system to the `rbac-backend` plugin ([#1179](https://github.com/janus-idp/backstage-plugins/issues/1179)) ([d625cb2](https://github.com/janus-idp/backstage-plugins/commit/d625cb2470513862027e048c70944275043ce70a))



### Dependencies

* **@janus-idp/backstage-plugin-rbac-node:** upgraded to 1.0.0

## @janus-idp/backstage-plugin-rbac-backend [2.1.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.1.2...@janus-idp/backstage-plugin-rbac-backend@2.1.3) (2024-02-02)


### Bug Fixes

* **rbac:** set up higher jest timeout for rbac db tests ([#1163](https://github.com/janus-idp/backstage-plugins/issues/1163)) ([b8541f3](https://github.com/janus-idp/backstage-plugins/commit/b8541f3ac149446238dc07432116fafc23a48a82))
* **rbac:** split policies and roles by source ([#1042](https://github.com/janus-idp/backstage-plugins/issues/1042)) ([03a678d](https://github.com/janus-idp/backstage-plugins/commit/03a678d96deeb1d42448e94ac95d735e61393a40)), closes [#1103](https://github.com/janus-idp/backstage-plugins/issues/1103)



### Dependencies

* **@janus-idp/backstage-plugin-rbac-common:** upgraded to 1.2.1

## @janus-idp/backstage-plugin-rbac-backend [2.1.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.1.1...@janus-idp/backstage-plugin-rbac-backend@2.1.2) (2024-01-30)


### Bug Fixes

* **rbac:** enable create button for default role:default/rbac_admin ([#1137](https://github.com/janus-idp/backstage-plugins/issues/1137)) ([9926463](https://github.com/janus-idp/backstage-plugins/commit/9926463c8c46871b823796adf77bbd52eb8e6758))

## @janus-idp/backstage-plugin-rbac-backend [2.1.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.1.0...@janus-idp/backstage-plugin-rbac-backend@2.1.1) (2024-01-23)


### Bug Fixes

* **rbac:** fix work resource permission specified by name ([#940](https://github.com/janus-idp/backstage-plugins/issues/940)) ([3601eb8](https://github.com/janus-idp/backstage-plugins/commit/3601eb8d0c19e0aad27031ab61f1afa0edc78945))

## @janus-idp/backstage-plugin-rbac-backend [2.1.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@2.0.0...@janus-idp/backstage-plugin-rbac-backend@2.1.0) (2024-01-17)


### Features

* **Notifications:** new notifications FE plugin, API and backend ([#933](https://github.com/janus-idp/backstage-plugins/issues/933)) ([4d4cb78](https://github.com/janus-idp/backstage-plugins/commit/4d4cb781ca9fc331a2c621583e9203f9e4585ee7))
* **rbac:** add doc about RBAC backend conditions API ([#1027](https://github.com/janus-idp/backstage-plugins/issues/1027)) ([fc9ad53](https://github.com/janus-idp/backstage-plugins/commit/fc9ad5348d768423cbce0df7e2a4239c9a24a11e))


### Bug Fixes

* **rbac:** fix role validation ([#1020](https://github.com/janus-idp/backstage-plugins/issues/1020)) ([49c7975](https://github.com/janus-idp/backstage-plugins/commit/49c7975f74a1791e205fe3a322f1efe6504212ed))

## @janus-idp/backstage-plugin-rbac-backend [2.0.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.7.1...@janus-idp/backstage-plugin-rbac-backend@2.0.0) (2023-12-14)


### ⚠ BREAKING CHANGES

* **rbac:** add support for multiple policies CRUD (#984)

### Features

* **rbac:** add support for multiple policies CRUD ([#984](https://github.com/janus-idp/backstage-plugins/issues/984)) ([518c767](https://github.com/janus-idp/backstage-plugins/commit/518c7674aa037669fe9c2fc6f8dc9be5f0c8fa84))

## @janus-idp/backstage-plugin-rbac-backend [1.7.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.7.0...@janus-idp/backstage-plugin-rbac-backend@1.7.1) (2023-12-08)


### Documentation

* **rbac:** add documentation for api and known permissions ([#1000](https://github.com/janus-idp/backstage-plugins/issues/1000)) ([8f8133f](https://github.com/janus-idp/backstage-plugins/commit/8f8133f12d2a74dc6503f7545942f11c40b52092))

## @janus-idp/backstage-plugin-rbac-backend [1.7.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.6.6...@janus-idp/backstage-plugin-rbac-backend@1.7.0) (2023-12-07)


### Features

* **rbac:** list roles with no permission policies ([#998](https://github.com/janus-idp/backstage-plugins/issues/998)) ([217b7b0](https://github.com/janus-idp/backstage-plugins/commit/217b7b0db3414788c8e77247f378a51cf0eeda0d))

## @janus-idp/backstage-plugin-rbac-backend [1.6.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.6.5...@janus-idp/backstage-plugin-rbac-backend@1.6.6) (2023-12-05)



### Dependencies

* **@janus-idp/backstage-plugin-rbac-common:** upgraded to 1.2.0

## @janus-idp/backstage-plugin-rbac-backend [1.6.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.6.4...@janus-idp/backstage-plugin-rbac-backend@1.6.5) (2023-12-04)


### Documentation

* **rbac:** additional docs for backend configuration ([#982](https://github.com/janus-idp/backstage-plugins/issues/982)) ([17b95a0](https://github.com/janus-idp/backstage-plugins/commit/17b95a0c51e97ee5a9160dc7bec7559c075eca88))

## @janus-idp/backstage-plugin-rbac-backend [1.6.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.6.3...@janus-idp/backstage-plugin-rbac-backend@1.6.4) (2023-11-20)


### Bug Fixes

* **aap+3scale+ocm:** don't log sensitive data from errors ([#945](https://github.com/janus-idp/backstage-plugins/issues/945)) ([7a5e7b8](https://github.com/janus-idp/backstage-plugins/commit/7a5e7b8a57c9841003d9b16e1a65fb62e101fbf1))

## @janus-idp/backstage-plugin-rbac-backend [1.6.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.6.2...@janus-idp/backstage-plugin-rbac-backend@1.6.3) (2023-11-13)


### Bug Fixes

* **rbac:** use the same Knex version with Backstage ([#929](https://github.com/janus-idp/backstage-plugins/issues/929)) ([6923ce0](https://github.com/janus-idp/backstage-plugins/commit/6923ce07d787ea6edd911ab348704ba6b9f95ada))

## @janus-idp/backstage-plugin-rbac-backend [1.6.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.6.1...@janus-idp/backstage-plugin-rbac-backend@1.6.2) (2023-11-10)


### Bug Fixes

* **rbac:** handle postgres ssl connection for rbac backend plugin ([#923](https://github.com/janus-idp/backstage-plugins/issues/923)) ([deb2026](https://github.com/janus-idp/backstage-plugins/commit/deb202642f456cda446a99f55a475eeaddc59e7c))

## @janus-idp/backstage-plugin-rbac-backend [1.6.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.6.0...@janus-idp/backstage-plugin-rbac-backend@1.6.1) (2023-11-01)


### Bug Fixes

* **rbac:** add migration folder to rbac-backend package ([#897](https://github.com/janus-idp/backstage-plugins/issues/897)) ([694a9d6](https://github.com/janus-idp/backstage-plugins/commit/694a9d65bd986eb8e7fde3d66e012963033741af))

## @janus-idp/backstage-plugin-rbac-backend [1.6.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.5.1...@janus-idp/backstage-plugin-rbac-backend@1.6.0) (2023-10-31)


### Features

* **rbac:** implement REST method to list all plugin permission policies ([#808](https://github.com/janus-idp/backstage-plugins/issues/808)) ([0a17e67](https://github.com/janus-idp/backstage-plugins/commit/0a17e67cbb72416176e978fc3ed8868855375a8b))

## @janus-idp/backstage-plugin-rbac-backend [1.5.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.5.0...@janus-idp/backstage-plugin-rbac-backend@1.5.1) (2023-10-30)


### Bug Fixes

* **rbac:** fix service to service requests for RBAC CRUD ([#886](https://github.com/janus-idp/backstage-plugins/issues/886)) ([0b72d73](https://github.com/janus-idp/backstage-plugins/commit/0b72d7373dddc3f4d8c5076ca3800745bf619d85))

## @janus-idp/backstage-plugin-rbac-backend [1.5.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.4.0...@janus-idp/backstage-plugin-rbac-backend@1.5.0) (2023-10-30)


### Features

* **rbac:** implement conditional policies feature. ([#833](https://github.com/janus-idp/backstage-plugins/issues/833)) ([3c0675b](https://github.com/janus-idp/backstage-plugins/commit/3c0675ba6ebf91274848981fa1e6eab9e4a1e659))

## @janus-idp/backstage-plugin-rbac-backend [1.4.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.3.0...@janus-idp/backstage-plugin-rbac-backend@1.4.0) (2023-10-30)


### Features

* **rbac:** add role support for policies-csv-file ([#894](https://github.com/janus-idp/backstage-plugins/issues/894)) ([7ad4902](https://github.com/janus-idp/backstage-plugins/commit/7ad4902be12a9900149a73427a6c52cbb65659f3))

## @janus-idp/backstage-plugin-rbac-backend [1.3.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.2.1...@janus-idp/backstage-plugin-rbac-backend@1.3.0) (2023-10-27)


### Features

* **rbac:** implement the concept of roles in rbac ([#867](https://github.com/janus-idp/backstage-plugins/issues/867)) ([4d878a2](https://github.com/janus-idp/backstage-plugins/commit/4d878a29babd86bd7896d69e6b2b63392b6e6cc8))


### Bug Fixes

* **rbac:** add models folder and config.d.ts to package ([#891](https://github.com/janus-idp/backstage-plugins/issues/891)) ([406c147](https://github.com/janus-idp/backstage-plugins/commit/406c14703110018c702834482d32fdd4f8a36cef))



### Dependencies

* **@janus-idp/backstage-plugin-rbac-common:** upgraded to 1.1.0

## @janus-idp/backstage-plugin-rbac-backend [1.2.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.2.0...@janus-idp/backstage-plugin-rbac-backend@1.2.1) (2023-10-24)


### Bug Fixes

* **rbac:** use token manager for catalog requests ([#866](https://github.com/janus-idp/backstage-plugins/issues/866)) ([8ad3480](https://github.com/janus-idp/backstage-plugins/commit/8ad348029cec4eabf605c7065e76a5305be3cac8))

## @janus-idp/backstage-plugin-rbac-backend [1.2.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.1.1...@janus-idp/backstage-plugin-rbac-backend@1.2.0) (2023-10-23)


### Features

* **cli:** add frontend dynamic plugins base build config ([#747](https://github.com/janus-idp/backstage-plugins/issues/747)) ([91e06da](https://github.com/janus-idp/backstage-plugins/commit/91e06da8ab108c17fd2a6531f25e01c7a7350276)), closes [#831](https://github.com/janus-idp/backstage-plugins/issues/831)

## @janus-idp/backstage-plugin-rbac-backend [1.1.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.1.0...@janus-idp/backstage-plugin-rbac-backend@1.1.1) (2023-10-19)



### Dependencies

* **@janus-idp/backstage-plugin-rbac-common:** upgraded to 1.0.1

## @janus-idp/backstage-plugin-rbac-backend [1.1.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.0.2...@janus-idp/backstage-plugin-rbac-backend@1.1.0) (2023-10-06)


### Features

* **rbac:** implement RBAC group support ([#803](https://github.com/janus-idp/backstage-plugins/issues/803)) ([4c72f5c](https://github.com/janus-idp/backstage-plugins/commit/4c72f5c23324ea2f7538b406d60730ea224ae758))

## @janus-idp/backstage-plugin-rbac-backend [1.0.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.0.1...@janus-idp/backstage-plugin-rbac-backend@1.0.2) (2023-10-04)


### Bug Fixes

* **rbac:** add models folder to package ([#823](https://github.com/janus-idp/backstage-plugins/issues/823)) ([e2bc66e](https://github.com/janus-idp/backstage-plugins/commit/e2bc66edac61a16ec92f75fb48c8ad459f24a23a))

## @janus-idp/backstage-plugin-rbac-backend [1.0.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-rbac-backend@1.0.0...@janus-idp/backstage-plugin-rbac-backend@1.0.1) (2023-10-03)


### Documentation

* **rbac:** initial documentation for RBAC ([#814](https://github.com/janus-idp/backstage-plugins/issues/814)) ([d5cd566](https://github.com/janus-idp/backstage-plugins/commit/d5cd5666c43be5ca2790b1c548f56350ef50c96c))

## @janus-idp/backstage-plugin-rbac-backend 1.0.0 (2023-09-29)


### Bug Fixes

* **rbac:** remove private package ([#809](https://github.com/janus-idp/backstage-plugins/issues/809)) ([cf59d6d](https://github.com/janus-idp/backstage-plugins/commit/cf59d6d1c5a65363a7ccdd7490d3148d665e7d46))



### Dependencies

* **@janus-idp/backstage-plugin-rbac-common:** upgraded to 1.0.0
