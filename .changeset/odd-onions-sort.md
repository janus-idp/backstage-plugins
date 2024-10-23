---
'@janus-idp/backstage-plugin-keycloak-backend': patch
---

Provide keycloak-backend fixes:

- avoid undefined values for keycloak group members
- retrieve full list group members using pagination
- revert unexpected major upgrade of the keycloak backend plugin
