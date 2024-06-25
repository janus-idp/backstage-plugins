# Bulk import frontend plugin for Backstage

This plugin allows bulk import of multiple catalog entities into the catalog.

## For administrators

### Installation

#### Installing as a dynamic plugin?

The sections below are relevant for static plugins. If the plugin is expected to be installed as a dynamic one:

- follow https://github.com/janus-idp/backstage-showcase/blob/main/showcase-docs/dynamic-plugins.md#installing-a-dynamic-plugin-package-in-the-showcase
- add content of `app-config.janus-idp.yaml` into `app-config.local.yaml`.

#### Prerequisites

- Follow the Bulk import backend plugin [README](https://github.com/janus-idp/backstage-plugins/blob/main/plugins/bulk-import-backend/README.md) to integrate bulk import in your Backstage instance.

- Follow the [GitHub Locations](https://backstage.io/docs/integrations/github/locations) to integrate GitHub integrations in your Backstage instance. For now, the plugin only supports loading catalog entities from github.com or GitHub Enterprise.

---

**NOTE**

- When RBAC permission framework is enabled, for non-admin users wanting to access bulk import UI, the role associated with your user should have the following permission policies associated with it. Add the following in your permission policies configuration file:

```CSV
p, role:default/team_a, catalog-entity.read, read, allow
p, role:default/team_a, catalog-entity.create, create, allow
g, user:default/<login-id/user-name>, role:default/team_a
```

#### Procedure

1. Install the Bulk import UI plugin using the following command:

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-bulk-import
   ```

2. Add Route in `packages/app/src/App.tsx`:

   ```tsx title="packages/app/src/App.tsx"
   /* highlight-add-next-line */
   import { BulkImportPage } from '@janus-idp/backstage-plugin-bulk-import';
   ...
   /* highlight-add-start */
   <Route
        path="/bulk-import"
        element={<Navigate to="repositories" />}
    />
    <Route
        path="/bulk-import/repositories"
        element={<BulkImportPage />}
    />
    /* highlight-add-end */
   ...
   ```

3. Add **Bulk import** Sidebar Item in `packages/app/src/components/Root/Root.tsx`:

   ```tsx title="packages/app/src/components/Root/Root.tsx"
   /* highlight-add-next-line */
   import { BulkImportSidebarItem } from '@janus-idp/backstage-plugin-bulk-import';

   export const Root = ({ children }: PropsWithChildren<{}>) => (
    <SidebarPage>
      <Sidebar>
      ...
      /* highlight-add-next-line */
      <BulkImportSidebarItem />
      ...
    </SidebarPage>
   );
   ```
