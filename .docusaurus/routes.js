import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '68d'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', 'ec3'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', 'bb2'),
            routes: [
              {
                path: '/docs/architecture/components',
                component: ComponentCreator('/docs/architecture/components', '123'),
                exact: true
              },
              {
                path: '/docs/architecture/data-flow',
                component: ComponentCreator('/docs/architecture/data-flow', 'd38'),
                exact: true
              },
              {
                path: '/docs/architecture/overview',
                component: ComponentCreator('/docs/architecture/overview', '685'),
                exact: true
              },
              {
                path: '/docs/deployment/docker',
                component: ComponentCreator('/docs/deployment/docker', 'bc6'),
                exact: true
              },
              {
                path: '/docs/deployment/kubernetes',
                component: ComponentCreator('/docs/deployment/kubernetes', '3bf'),
                exact: true
              },
              {
                path: '/docs/deployment/production-setup',
                component: ComponentCreator('/docs/deployment/production-setup', 'e5f'),
                exact: true
              },
              {
                path: '/docs/development/contributing',
                component: ComponentCreator('/docs/development/contributing', '582'),
                exact: true
              },
              {
                path: '/docs/development/local-setup',
                component: ComponentCreator('/docs/development/local-setup', 'cba'),
                exact: true
              },
              {
                path: '/docs/getting-started/overview',
                component: ComponentCreator('/docs/getting-started/overview', '3b4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/getting-started/quick-start',
                component: ComponentCreator('/docs/getting-started/quick-start', '09c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/repositories/mlops-helm-charts',
                component: ComponentCreator('/docs/repositories/mlops-helm-charts', 'bdc'),
                exact: true
              },
              {
                path: '/docs/repositories/mlops-platform',
                component: ComponentCreator('/docs/repositories/mlops-platform', '3c7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/repositories/mlops-research-template',
                component: ComponentCreator('/docs/repositories/mlops-research-template', '673'),
                exact: true
              },
              {
                path: '/docs/repositories/overview',
                component: ComponentCreator('/docs/repositories/overview', '16f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/researcher-guide/best-practices',
                component: ComponentCreator('/docs/researcher-guide/best-practices', '4af'),
                exact: true
              },
              {
                path: '/docs/researcher-guide/overview',
                component: ComponentCreator('/docs/researcher-guide/overview', '93d'),
                exact: true
              },
              {
                path: '/docs/researcher-guide/setup',
                component: ComponentCreator('/docs/researcher-guide/setup', '4e4'),
                exact: true
              },
              {
                path: '/docs/researcher-guide/tracking-experiments',
                component: ComponentCreator('/docs/researcher-guide/tracking-experiments', 'd43'),
                exact: true
              },
              {
                path: '/docs/researcher-guide/training',
                component: ComponentCreator('/docs/researcher-guide/training', 'e0d'),
                exact: true
              },
              {
                path: '/docs/tools/docker',
                component: ComponentCreator('/docs/tools/docker', '1b7'),
                exact: true
              },
              {
                path: '/docs/tools/kubernetes',
                component: ComponentCreator('/docs/tools/kubernetes', '824'),
                exact: true
              },
              {
                path: '/docs/tools/minio',
                component: ComponentCreator('/docs/tools/minio', 'c80'),
                exact: true
              },
              {
                path: '/docs/tools/mlflow',
                component: ComponentCreator('/docs/tools/mlflow', 'a7c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/overview',
                component: ComponentCreator('/docs/tools/overview', 'efb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/postgres',
                component: ComponentCreator('/docs/tools/postgres', 'e44'),
                exact: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
