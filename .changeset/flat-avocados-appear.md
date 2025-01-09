---
"@janus-idp/cli": major
---
changes to package-dynamic-plugins command:

- rename com.redhat.rhdh.plugins to io.backstage.dynamic-packages to make it more "upstream friendly"
- add io.backstage.marketplace/<plugin-name> annotations, value is read from file specified by optional --marketplace flag
- use base64 for annotation values