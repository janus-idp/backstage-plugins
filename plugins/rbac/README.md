# RBAC frontend plugin for Backstage

The RBAC UI plugin offers a streamlined user interface for effectively managing permissions in your Backstage instance. It allows you to assign permissions to users and groups, empowering them to view, create, modify and delete Roles, provided they have the necessary permissions.

## For administrators

### Installation

#### Installing as a dynamic plugin?

The sections below are relevant for static plugins. If the plugin is expected to be installed as a dynamic one:

- follow https://github.com/janus-idp/backstage-showcase/blob/main/showcase-docs/dynamic-plugins.md#installing-a-dynamic-plugin-package-in-the-showcase
- add content of `app-config.janus-idp.yaml` into `app-config.local.yaml`.

#### Prerequisites

Follow the RBAC backend plugin [README](https://github.com/janus-idp/backstage-plugins/blob/main/plugins/rbac-backend/README.md) to integrate rbac in your Backstage instance.

---

**NOTE**

- For non-admin users, to enable create role button on Administration -> RBAC roles list page, the role associated with your user should have the following permission policies associated with it. Add the following in your permission policies configuration file:

```CSV
p, role:default/team_a, catalog-entity, read, allow
p, role:default/team_a, policy-entity, create, allow
g, user:default/<login-id/user-name>, role:default/team_a
```

- To fetch the permissions from other plugins like `Kubernetes` and `Jenkins` in the Role Form as mentioned [here](https://github.com/janus-idp/backstage-plugins/blob/main/plugins/rbac-backend/docs/permissions.md), add the following configuration in your `app-config.yaml`:

```yaml title="app-config.yaml"
permission:
  enabled: true
  rbac:
    pluginsWithPermission:
      - kubernetes
      - jenkins
    admin:
      users:
        - name: user:default/<user-name>
```

---

#### Procedure

1. Install the RBAC UI plugin executing the following command from the Backstage root directory :

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-rbac
   ```

2. Add Route in `packages/app/src/App.tsx`:

   ```tsx title="packages/app/src/App.tsx"
   /* highlight-add-next-line */ import { RbacPage } from '@janus-idp/backstage-plugin-rbac';

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
      <Sidebar>
    </SidebarPage>
   );
   ```

4. For users with vanilla backstage instance, would need to integrate [`Auth`](https://backstage.io/docs/auth/) in to the instance:

   - ```yaml title="app-config.yaml"
     # see https://backstage.io/docs/auth/ to learn about auth providers
     environment: development
     providers:
        # Plugin: GitHub
        github:
           development:
           clientId: ${GITHUB_BUCKET_CLIENT_ID}
           clientSecret: ${GITHUB_BUCKET_SECRET}
        # Plugin: BitBucket
        bitbucket:
           development:
           clientId: ${BIT_BUCKET_CLIENT_ID}
           clientSecret: ${BIT_BUCKET_SECRET}
        ...
     ```

   - Integrate the [`SignIn`](https://backstage.io/docs/auth/#sign-in-configuration) component to be able to sign-in to the Backstage instance.
