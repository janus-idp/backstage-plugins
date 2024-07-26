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
