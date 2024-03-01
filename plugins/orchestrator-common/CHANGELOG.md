## @janus-idp/backstage-plugin-orchestrator-common [1.3.6](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-orchestrator-common@1.3.5...@janus-idp/backstage-plugin-orchestrator-common@1.3.6) (2024-02-29)


### Bug Fixes

* **orchestrator:** refactor 500 response to use ErrorResponse object ([#1290](https://github.com/janus-idp/backstage-plugins/issues/1290)) ([2580f3d](https://github.com/janus-idp/backstage-plugins/commit/2580f3d38cecf78334964666eb7c127c21b00924))

## @janus-idp/backstage-plugin-orchestrator-common [1.3.5](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-orchestrator-common@1.3.4...@janus-idp/backstage-plugin-orchestrator-common@1.3.5) (2024-02-28)


### Bug Fixes

* **orchestrator:** clean up the plugin code ([#1292](https://github.com/janus-idp/backstage-plugins/issues/1292)) ([ad27fb8](https://github.com/janus-idp/backstage-plugins/commit/ad27fb8e98913a6b80feb38ff58a7864e1953a7e))

## @janus-idp/backstage-plugin-orchestrator-common [1.3.4](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-orchestrator-common@1.3.3...@janus-idp/backstage-plugin-orchestrator-common@1.3.4) (2024-02-28)


### Bug Fixes

* **orchestrator:** regenerate Open API with new instance state ([#1289](https://github.com/janus-idp/backstage-plugins/issues/1289)) ([8755fdd](https://github.com/janus-idp/backstage-plugins/commit/8755fdd04dac406a4a02bfd7823d0993a6edf0b3))

## @janus-idp/backstage-plugin-orchestrator-common [1.3.3](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-orchestrator-common@1.3.2...@janus-idp/backstage-plugin-orchestrator-common@1.3.3) (2024-02-28)


### Bug Fixes

* **orchestrator:** handle nullable start/state properties of process instance ([#1277](https://github.com/janus-idp/backstage-plugins/issues/1277)) ([d8a43a5](https://github.com/janus-idp/backstage-plugins/commit/d8a43a5a164f83fc90d037ae3d7a355f5de543e0))

## @janus-idp/backstage-plugin-orchestrator-common [1.3.2](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-orchestrator-common@1.3.1...@janus-idp/backstage-plugin-orchestrator-common@1.3.2) (2024-02-27)


### Bug Fixes

* **orchestrator:** remove date-time format from spec ([#1282](https://github.com/janus-idp/backstage-plugins/issues/1282)) ([2b59dcf](https://github.com/janus-idp/backstage-plugins/commit/2b59dcf00082e617911289d8813ad02b83800470))

## @janus-idp/backstage-plugin-orchestrator-common [1.3.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-orchestrator-common@1.3.0...@janus-idp/backstage-plugin-orchestrator-common@1.3.1) (2024-02-21)


### Bug Fixes

* **orchestrator:** implementation of getWorkflowById (v2) ([#1233](https://github.com/janus-idp/backstage-plugins/issues/1233)) ([f9f9008](https://github.com/janus-idp/backstage-plugins/commit/f9f9008d29f244c2ae6d688d3e2dc9b65b705e5b))
* **orchestrator:** minor improvements and fixes ([#1242](https://github.com/janus-idp/backstage-plugins/issues/1242)) ([c9ec4cb](https://github.com/janus-idp/backstage-plugins/commit/c9ec4cbe1847268e8068edc69c7937c5e133c315))

## @janus-idp/backstage-plugin-orchestrator-common [1.3.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-orchestrator-common@1.2.1...@janus-idp/backstage-plugin-orchestrator-common@1.3.0) (2024-02-20)


### Features

* **orchestrator:** add OpenAPI v2 implementations ([#1182](https://github.com/janus-idp/backstage-plugins/issues/1182)) ([43ac2f3](https://github.com/janus-idp/backstage-plugins/commit/43ac2f3f492b5c977142a3cfd9868d5e193ceb02))


### Bug Fixes

* **orchestrator:** decommission the ProcessInstance.lastUpdate field ([#1230](https://github.com/janus-idp/backstage-plugins/issues/1230)) ([9724e27](https://github.com/janus-idp/backstage-plugins/commit/9724e27eaa84fe73d7724f28c86409681b7f79f8))

## @janus-idp/backstage-plugin-orchestrator-common [1.2.1](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-orchestrator-common@1.2.0...@janus-idp/backstage-plugin-orchestrator-common@1.2.1) (2024-02-16)


### Bug Fixes

* **orchestrator:** resolve mismatch between execution data and composed schema ([#1217](https://github.com/janus-idp/backstage-plugins/issues/1217)) ([af85114](https://github.com/janus-idp/backstage-plugins/commit/af851148935e1ed083709cac145520d7551de737))

## @janus-idp/backstage-plugin-orchestrator-common [1.2.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-orchestrator-common@1.1.0...@janus-idp/backstage-plugin-orchestrator-common@1.2.0) (2024-02-16)


### Features

* **orchestrator:** add OpenAPI support ([#1123](https://github.com/janus-idp/backstage-plugins/issues/1123)) ([bd88e23](https://github.com/janus-idp/backstage-plugins/commit/bd88e2304c93761ce6754985074f004a5a3c8c4b))

## @janus-idp/backstage-plugin-orchestrator-common [1.1.0](https://github.com/janus-idp/backstage-plugins/compare/@janus-idp/backstage-plugin-orchestrator-common@1.0.0...@janus-idp/backstage-plugin-orchestrator-common@1.1.0) (2024-02-02)


### Features

* **orchestrator:** add the ability to rerun workflows in a new instance ([#1141](https://github.com/janus-idp/backstage-plugins/issues/1141)) ([fe326df](https://github.com/janus-idp/backstage-plugins/commit/fe326df569caa5a9e7b7ec809c1c371a2a936010))

## @janus-idp/backstage-plugin-orchestrator-common 1.0.0 (2024-01-17)


### Features

* **orchestrator:** add orchestrator plugin ([#783](https://github.com/janus-idp/backstage-plugins/issues/783)) ([cf5fe74](https://github.com/janus-idp/backstage-plugins/commit/cf5fe74db6992d9f51f5073bbcf20c8c346357a1)), closes [#28](https://github.com/janus-idp/backstage-plugins/issues/28) [#38](https://github.com/janus-idp/backstage-plugins/issues/38) [#35](https://github.com/janus-idp/backstage-plugins/issues/35) [#21](https://github.com/janus-idp/backstage-plugins/issues/21)
