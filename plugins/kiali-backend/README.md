# Kiali Backend

This is the backend part of the Kiali plugin for Backstage. It is called by and responds to requests from the frontend [`@janus-idp/backstage-plugin-kiali`](https://github.com/janus-idp/backstage-plugins/tree/master/plugins/kiali) plugin.

It directly interfaces with the Kiali API control plane to obtain information about objects that will then be presented at the front end.

## Setup & Configuration

This plugin must be explicitly added to a Backstage app, along with it's peer frontend plugin.

The plugin requires configuration in the Backstage `app-config.yaml` to connect to a Kiali API control plane.

In addition, configuration of an entity's `catalog-info.yaml` helps identify which specific ServiceMesh object(s) should be presented on a specific entity catalog page.

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/kiali](http://localhost:3000/kiali).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.
