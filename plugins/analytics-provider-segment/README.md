# Analytics Module: Segment

This plugin provides an implementation of the Backstage Analytics API for
Segment. Once installed and configured, analytics events will be sent to
Segment as your users navigate and use your Backstage instance.

This plugin contains no other functionality.

## Installation

1. Install the plugin package in your Backstage app:

   ```console
   yarn workspace app add @janus-idp/backstage-plugin-analytics-provider-segment
   ```

2. Wire up the API implementation to your App in `packages/app/src/apis.ts`:

   ```tsx title="packages/app/src/apis.ts"
   /* highlight-add-start */
   import {
     analyticsApiRef,
     configApiRef,
     identityApiRef,
   } from '@backstage/core-plugin-api';

   import { SegmentAnalytics } from '@janus-idp/backstage-plugin-analytics-provider-segment';

   /* highlight-add-end */

   export const apis: AnyApiFactory[] = [
     // Other APIs...
     // Instantiate and register the GA Analytics API Implementation.
     /* highlight-add-start */
     createApiFactory({
       api: analyticsApiRef,
       deps: { configApi: configApiRef, identityApi: identityApiRef },
       factory: ({ configApi, identityApi }) =>
         SegmentAnalytics.fromConfig(configApi, identityApi),
     }),
     /* highlight-add-end */
   ];
   ```

3. Configure the plugin in your `app-config.yaml`:

The following is the minimum configuration required to start sending analytics
events to Segment. All that's needed is your Segment Write Key

```yaml title="app-config.yaml"
app:
  analytics:
    segment:
      # highlight-start
      writeKey: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      maskIP: true # prevents IP addresses from being sent if true
      # highlight-end
```

### Debugging and Testing

In pre-production environments, you may wish to set additional configurations
to turn off reporting to Analytics. You can do so like this:

```yaml title="app-config.yaml"
app:
  analytics:
    segment:
      # highlight-next-line
      testMode: true # prevents data from being sent if true
```

You might commonly set the above in an `app-config.local.yaml` file, which is
normally `gitignore`'d but loaded and merged in when Backstage is bootstrapped.

## Development

If you would like to contribute improvements to this plugin, the easiest way to
make and test changes is to do the following:

1. Clone the main Backstage monorepo `git clone git@github.com:janus-idp/backstage-plugins.git`
2. Install all dependencies `yarn install`
3. If one does not exist, create an `app-config.local.yaml` file in the root of
   the monorepo and add config for this plugin (see below)
4. Enter this plugin's working directory: `cd plugins/analytics-provider-segment`
5. Start the plugin in isolation: `yarn start`
6. Navigate to the playground page at `http://localhost:3000/segment`
7. Open the web console to see events fire when you navigate or when you
   interact with instrumented components.

Code for the isolated version of the plugin can be found inside the `./dev`
directory. Changes to the plugin are hot-reloaded.
