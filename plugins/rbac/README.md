# RBAC frontend plugin for Backstage

The RBAC UI plugin offers a streamlined user interface for effectively managing permissions in your Backstage instance. It allows you to assign permissions to users and groups, empowering them to view, create, modify and delete Roles, provided they have the necessary permissions.

## For administrators

### Installation

#### Prerequisites

Follow the RBAC backend plugin [README](https://github.com/janus-idp/backstage-plugins/tree/main/plugins/rbac-backend) to integrate rbac in your Backstage instance

---

**NOTE**

To enable create role button on Administration -> RBAC roles list page, the role associacted with your user should have the following permission policies associated with it. Add the following in your permission policies configuration file:

```CSV
p, role:default/team_a, catalog-entity, read, allow
p, role:default/team_a, policy-entity, create, allow
g, user:default/user, role:default/team_a
```

---

#### Procedure

1. Install the RBAC UI plugin using the following command:

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-rbac
   ```

2. Add Route in `packages/app/src/App.tsx`:

   ```tsx title="packages/app/src/App.tsx"
   /* highlight-add-next-line */
   import { RbacPage } from '@janus-idp/backstage-plugin-rbac';

   <Route path="/rbac" element={<RbacPage />} />;
   ```

3. Add **Administration** Sidebar Item in `packages/app/src/components/Root/Root.tsx`:

   ```tsx title="packages/app/src/components/Root/Root.tsx"
   /* highlight-add-next-line */
   import { Administration } from '@janus-idp/backstage-plugin-rbac';

   export const Root = ({ children }: PropsWithChildren<{}>) => (
    <SidebarPage>
      <Sidebar>
      ...
      <Administration />
      ...
    </SidebarPage>
   );
   ```
