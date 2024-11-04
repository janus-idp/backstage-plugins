---
"@janus-idp/backstage-plugin-orchestrator-form-react": patch
"@janus-idp/backstage-plugin-orchestrator-form-api": patch
---

Resolved the following issues:

1. enabled validation using customValidate, and replaced extraErrors with getExtraErrors, since extraErrors is supposed to be populated when running onSubmit, and that isn't exposed to the user. Added busy handling while calling getExtraErrors.
2. moved FormComponent to a separate component, to avoid buggy behavior and code smells with component generated in a different component.
3. update formData on each change instead of when moving to next step, to avoid data being cleared.
4. fix bug in validator - it only worked in first step, because of issue in @rjsf form
5. removed unnecessary package json-schema that was used just for lint error, and fixed the root cause of lint error when importing types from @types/json-schema
