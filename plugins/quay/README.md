# quay-frontend

Welcome to the quay-frontend plugin!
This plugin will show you information about your docker images within quay

_This plugin was created through the Backstage CLI_

## Getting started

### Enabling frontend 
```bash
cd packages/app
yarn add @fmenesesg/backstage-plugin-quay
```
```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  QuayPage,
  isQuayAvailable,
} from '@fmenesesg/backstage-plugin-quay';

const serviceEntityPage = (
  <EntityPageLayout>
    // ...
    <EntityLayout.Route if={isQuayAvailable} path="/quay" title="Quay">
        <QuayPage />
     </EntityLayout.Route>
  </EntityPageLayout>
)
```
