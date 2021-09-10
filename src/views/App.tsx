/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { Suspense } from 'react';
// import { hot } from 'react-hot-loader/root';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
import { QueryParamProvider } from 'use-query-params';
import { initFeatureFlags } from 'src/featureFlags';
import { ThemeProvider } from '@superset-ui/core';
import { DynamicPluginProvider } from 'src/components/DynamicPlugins';
import ErrorBoundary from 'src/components/ErrorBoundary';
import Loading from 'src/components/Loading';
// import Menu from 'src/components/Menu/Menu';
// import FlashProvider from 'src/components/FlashProvider';
import { theme } from 'src/preamble';
import ToastPresenter from 'src/messageToasts/containers/ToastPresenter';
import setupPlugins from 'src/setup/setupPlugins';
import setupApp from 'src/setup/setupApp';
import { routes } from 'src/views/routes';
import { store } from './store';
import { cookie } from '../utils/cookie.js'

setupApp();
setupPlugins();

const container = document.getElementById('app');
const bootstrap = container
  ? JSON.parse(container.getAttribute('data-bootstrap') || '{}')
  : {};
const user = { ...bootstrap.user };
const common = { ...bootstrap.common };
initFeatureFlags(common.feature_flags);


// 回调函数
function saveToken(event: Object) {
  cookie('token', '')
  const opts = { expires: 30, path: '/' }
  const token = event.data.token
  if (token) cookie('token', token, opts)
  cookie('token', '31admin1631000168399', opts)
  console.log('saveToken', token, opts )
}

window.addEventListener('message', saveToken, false)

const RootContextProviders: React.FC = ({ children }) => (
  <ThemeProvider theme={theme}>
    <ReduxProvider store={store}>
      <DynamicPluginProvider>
        <QueryParamProvider
          ReactRouterRoute={Route}
          stringifyOptions={{ encode: false }}
        >
          {children}
        </QueryParamProvider>
      </DynamicPluginProvider>
    </ReduxProvider>
  </ThemeProvider>
);

const App = () => (
  <Router>
    <RootContextProviders>
      <Switch>
        {routes.map(({ path, Component, props = {}, Fallback = Loading }) => (
          <Route path={path} key={path}>
            <Suspense fallback={<Fallback />}>
              <ErrorBoundary>
                <Component user={user} {...props} />
              </ErrorBoundary>
            </Suspense>
          </Route>
        ))}
      </Switch>
      <ToastPresenter />
    </RootContextProviders>
  </Router>
);

export default App;
