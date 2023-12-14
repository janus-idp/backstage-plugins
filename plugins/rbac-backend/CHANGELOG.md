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
