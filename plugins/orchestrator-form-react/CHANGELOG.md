### Dependencies

## 1.0.101

### Patch Changes

- e94a6c1: backport all orchestrator commits since release 1.2
- Updated dependencies [e94a6c1]
  - @janus-idp/backstage-plugin-orchestrator-form-api@1.0.101

## 1.4.1

### Patch Changes

- 0e6bfd3: feat: update Backstage to the latest version

  Update to Backstage 1.32.5

- 67f466a: Resolved the following issues:

  1. enabled validation using customValidate, and replaced extraErrors with getExtraErrors, since extraErrors is supposed to be populated when running onSubmit, and that isn't exposed to the user. Added busy handling while calling getExtraErrors.
  2. moved FormComponent to a separate component, to avoid buggy behavior and code smells with component generated in a different component.
  3. update formData on each change instead of when moving to next step, to avoid data being cleared.
  4. fix bug in validator - it only worked in first step, because of issue in @rjsf form
  5. removed unnecessary package json-schema that was used just for lint error, and fixed the root cause of lint error when importing types from @types/json-schema

- Updated dependencies [0e6bfd3]
- Updated dependencies [67f466a]
  - @janus-idp/backstage-plugin-orchestrator-form-api@1.4.1

## 1.4.0

### Minor Changes

- 8244f28: chore(deps): update to backstage 1.32

### Patch Changes

- Updated dependencies [8244f28]
  - @janus-idp/backstage-plugin-orchestrator-form-api@1.4.0

## 1.3.1

### Patch Changes

- 7342e9b: chore: remove @janus-idp/cli dep and relink local packages

  This update removes `@janus-idp/cli` from all plugins, as it’s no longer necessary. Additionally, packages are now correctly linked with a specified version.

## 1.3.0

### Minor Changes

- d9551ae: feat(deps): update to backstage 1.31

### Patch Changes

- d9551ae: Change local package references to a `*`
- d9551ae: upgrade to yarn v3
- Updated dependencies [d9551ae]
- Updated dependencies [d9551ae]
  - @janus-idp/backstage-plugin-orchestrator-form-api@1.3.0

* **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.21.0

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.20.0

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.19.0

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.18.2

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.18.1

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.18.0

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.17.3

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-form-api:** upgraded to 1.1.0

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.17.2

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.17.1

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.17.0

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.17.0

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.0.0
- **@janus-idp/backstage-plugin-orchestrator-form-api:** upgraded to 1.0.0

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.16.0

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.15.2

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.15.1

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-common:** upgraded to 1.15.0

### Dependencies

- **@janus-idp/backstage-plugin-orchestrator-form-api:** upgraded to 1.0.1
