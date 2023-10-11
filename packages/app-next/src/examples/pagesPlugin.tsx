/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { Link } from '@backstage/core-components';
import { createRouteRef } from '@backstage/core-plugin-api';
import {
  createPageExtension,
  createPlugin,
  useRouteRef,
} from '@backstage/frontend-plugin-api';

import { preloadModule } from '@scalprum/core';
import {
  ScalprumComponent,
  ScalprumComponentProps,
} from '@scalprum/react-core';

import LocalComponent from '../components/LocalComponent';

const indexRouteRef = createRouteRef({ id: 'index' });
const page1RouteRef = createRouteRef({ id: 'page1' });

export interface ScalprumPageOptions {
  path: string;
  dynamic: {
    pluginName: string;
    module: string;
    assetsHost: string;
    title: string;
  };
}

const ThemeSpy = () => {
  return null;
};

export const ScalprumPage = createPageExtension<ScalprumPageOptions, {}>({
  id: 'dynamicPage',
  defaultPath: '/dynamic',
  // configSchema: {
  //   parse: (input) => {
  //     return input as ScalprumPageOptions;
  //   },
  //   schema: createSchemaFromZod(z =>
  //     z.object({
  //       path: z.string().default('/dynamic'),
  //       dynamic: z.object({
  //         pluginName: z.string(),
  //         module: z.string(),
  //         assetsHost: z.string(),
  //         title: z.string(),
  //       }),
  //     }),
  //   ) as unknown as JsonObject,
  // },
  loader: async () => {
    const dynamic = {
      pluginName: 'janus.dynamic-frontend-plugin',
      assetsHost: 'http://localhost:8004',
      module: './DummyDynamicComponent',
      title: 'Custom title prop',
    };
    const props: ScalprumComponentProps<{}, { text: string }> = {
      scope: dynamic.pluginName,
      module: dynamic.module,
      text: dynamic.title,
    };
    return (
      <>
        <ThemeSpy />
        <ScalprumComponent {...props} />
        <br />
        <h1>A local component to test context behavior differences</h1>
        <LocalComponent />
      </>
    );
  },
});

/**
 * Backstage plugins are seem not to be compatible yet because of missing context
 * Routing context is not available
 * We will probably have to wait for backstage to update their core plugins on the new UI system
 * Currently the routing context is not finished: https://github.com/backstage/backstage/blob/321eb06b5cb39762fe92b226acee57da5e7788dc/packages/frontend-plugin-api/src/routing/useRouteRef.ts#L18
 *
 * We are using the `Router` exported member to skip the routing wrappers
 *
 * Have to wait until we can add APIs to the app root
 */
export const ScalprumUserSettingsPage = createPageExtension<
  ScalprumPageOptions,
  {}
>({
  id: 'userSettings',
  defaultPath: '/user-settings',
  loader: async () => {
    return (
      <ScalprumComponent
        scope="janus.dynamic-frontend-plugin"
        module="./UserSettingsPage"
      />
    );
  },
});

const IndexPage = createPageExtension({
  id: 'index',
  defaultPath: '/',
  routeRef: indexRouteRef,
  loader: async () => {
    const Component = () => {
      return (
        <div>
          op
          <div>
            <Link to="/page1">Page 1</Link>
          </div>
          <div>
            <Link to="/graphiql">GraphiQL</Link>
          </div>
          <div>
            <Link to="/tech-radar">Tech radar</Link>
          </div>
          <div>
            <Link
              onMouseEnter={() => {
                preloadModule(
                  'janus.dynamic-frontend-plugin',
                  './DummyDynamicComponent',
                );
              }}
              to="/dynamic"
            >
              Scalprum dynamic page
            </Link>
          </div>
          <div>
            <Link to="/user-settings">Rebuild user settings page</Link>
          </div>
        </div>
      );
    };
    return <Component />;
  },
});

const Page1 = createPageExtension({
  id: 'page1',
  defaultPath: '/page1/*',
  routeRef: page1RouteRef,
  loader: async () => {
    const Component = () => {
      const indexLink = useRouteRef(indexRouteRef);
      // const page2Link = useRouteRef(page2RouteRef);

      return (
        <div>
          <h1>This is page 1</h1>
          <Link to={indexLink()}>Go back</Link>
          <Link to="./page2">Page 2</Link>
          {/* <Link to={page2Link()}>Page 2</Link> */}

          <div>
            Sub-page content:
            <div>
              <Routes>
                <Route path="/" element={<h2>This is also page 1</h2>} />
                <Route path="page2" element={<h2>This is page 2</h2>} />
              </Routes>
            </div>
          </div>
        </div>
      );
    };
    return <Component />;
  },
});

export const pagesPlugin = createPlugin({
  id: 'pages',
  extensions: [IndexPage, Page1, ScalprumPage, ScalprumUserSettingsPage],
});
