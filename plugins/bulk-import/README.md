# Bulk import frontend plugin for Backstage

This plugin allows bulk import of multiple catalog entities into the catalog.

---

**NOTE**

The plugin work is still work in progress

---

## For administrators

### Installation

#### Procedure

1. Install the Bulk import UI plugin using the following command:

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-bulk-import
   ```

2. Add Route in `packages/app/src/App.tsx`:

   ```tsx title="packages/app/src/App.tsx"
   /* highlight-add-next-line */
   import { BulkImportPage } from '@janus-idp/backstage-plugin-bulk-import’;

   <Route
        path="/bulk-import"
        element={<Navigate to="repositories" />}
    />
    <Route
        path="/bulk-import/repositories"
        element={<BulkImportPage />}
    />
   ```

3. Add **Bulk import** Sidebar Item in `packages/app/src/components/Root/Root.tsx`:

   ```tsx title="packages/app/src/components/Root/Root.tsx"
   /* highlight-add-next-line */
   import { BulkImportIcon } from '@janus-idp/backstage-plugin-bulk-import’;

   export const Root = ({ children }: PropsWithChildren<{}>) => (
    <SidebarPage>
      <Sidebar>
      ...
      <BulkImportIcon />
      ...
    </SidebarPage>
   );
   ```
