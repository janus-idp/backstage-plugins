import React from 'react';

import { PluginRouter } from './PluginRouter';
import { ToastProvider } from '../context/toast';

export const App = () => {
  return (
    <ToastProvider>
      <PluginRouter />
    </ToastProvider>
  );
};
