import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { kubernetesPlugin, KubernetesPage } from '../src/plugin';

createDevApp()
  .registerPlugin(kubernetesPlugin)
  .addPage({
    element: <KubernetesPage />,
    title: 'Root Page',
    path: '/kubernetes',
  })
  .render();
