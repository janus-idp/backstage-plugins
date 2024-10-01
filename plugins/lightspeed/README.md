# Lightspeed plugin for Backstage

The Lightspeed plugin enables you to interact with any LLM server running a model with OpenAI's API compatibility.

## For administrators

### Installation

1. Install the Lightspeed plugin using the following command:

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-lightspeed
   ```

### Configuration

1. Set the proxy to the desired LLM server in the `app-config.yaml` file as follows:

   ```yaml title="app-config.yaml"
   proxy:
     endpoints:
       '/lightspeed/api':
         target: http://localhost:11434/v1/
         headers:
           Authorization: Bearer <token>
   ```

2. Add a new nav item **Lightspeed** in App `packages/app/src/App.tsx`:

   ```tsx title="packages/app/src/components/App.tsx"
   /* highlight-add-next-line */ import { LightspeedPage } from '@janus-idp/backstage-plugin-lightspeed';

   <Route path="/lightspeed" element={<LightspeedPage />} />;
   ```

3. Enable **Lightspeed** page in `packages/app/src/components/Root/Root.tsx`:

   ```tsx title="packages/app/src/components/Root/Root.tsx"
   /* highlight-add-next-line */ import { LightspeedIcon } from '@janus-idp/backstage-plugin-lightspeed';

   <SidebarItem
     icon={LightspeedIcon as IconComponent}
     to="lightspeed"
     text="Lightspeed"
   />;
   ```

## For users

### Using the Lightspeed plugin in Backstage

Lightspeed is a front-end plugin that enables you to interact with any LLM server running a model with OpenAI's API compatibility.

#### Prerequisites

- Your Backstage application is installed and running.
- You have installed the Lightspeed plugin. For installation process, see [Installation](#installation).

#### Procedure

1. Open your Backstage application and select a Lightspeed nav item from the **Navigation**.
2. Ask you questions to the Lightspeed chatbot.

## Loading as Dynamic Plugin

#### To install Lightspeed plugin into Red Hat Developer Hub or Janus IDP via Helm use this configuration:

- Load the lightspeed plugin from the npm registry

```
global:
  dynamic:
    includes:
      - dynamic-plugins.default.yaml
    plugins:
      - package: '@janus-idp/backstage-plugin-lightspeed@0.1.2'
        integrity: >-
          sha512-bCKETjVhjZFLx7ImSFcptA3yvwJhFLFTFhMo/LvdVc0K5E76/SpEEkYBPup4aEQMivZBJKn0iVQFBuduChCDpA==
        disabled: false
        pluginConfig:
          dynamicPlugins:
            frontend:
              janus-idp.backstage-plugin-lightspeed:
                appIcons:
                  - name: LightspeedIcon
                    module: LightspeedPlugin
                    importName: LightspeedIcon
                dynamicRoutes:
                  - path: /lightspeed
                    importName: LightspeedPage
                    module: LightspeedPlugin
                    menuItem:
                      icon: LightspeedIcon
                      text: Lightspeed
```

- add the proxy configuration in the `app-config.yaml`

```
proxy:
 endpoints:
  '/lightspeed/api':
    target: http://localhost:11434/v1/
    headers:
      Authorization: Bearer <token>
```

---

#### To install this plugin locally in [backstage-showcase](https://github.com/janus-idp/backstage-showcase) application as a dynamic plugin.

Follow the below steps -

- Export dynamic plugin assets. This will build and create the static assets for the plugin and put it inside dist-scalprum folder.

`yarn install`

`yarn tsc`

`yarn build`

`yarn export-dynamic`

- Package and copy dist-scalprum folder assets to dynamic-plugins-root folder in [backstage-showcase](https://github.com/janus-idp/backstage-showcase) application.

To Package the plugin, run the below commands.

```
pkg=../plugins/lightspeed
archive=$(npm pack $pkg)
tar -xzf "$archive" && rm "$archive"
mv package $(echo $archive | sed -e 's:\.tgz$::')
```

- Add the extension point inside the `app-config.yaml` or `app-config.local.yaml` file.

```

proxy:
  endpoints:
     '/lightspeed/api':
      target: http://localhost:11434/v1/
      headers:
         Authorization: Bearer <token>

dynamicPlugins:
  frontend:
    janus-idp.backstage-plugin-lightspeed:
      appIcons:
        - name: LightspeedIcon
          module: LightspeedPlugin
          importName: LightspeedIcon
      dynamicRoutes:
        - path: /lightspeed
          importName: LightspeedPage
          module: LightspeedPlugin
          menuItem:
            icon: LightspeedIcon
            text: Lightspeed

```
