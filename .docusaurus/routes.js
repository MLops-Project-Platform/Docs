import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/docs',
    component: ComponentCreator('/docs', '36f'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '07a'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', 'd9f'),
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
                component: ComponentCreator('/docs/development/contributing', '98b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/development/local-setup',
                component: ComponentCreator('/docs/development/local-setup', '7f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/development/mlops-workflow',
                component: ComponentCreator('/docs/development/mlops-workflow', '532'),
                exact: true,
                sidebar: "tutorialSidebar"
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
                component: ComponentCreator('/docs/researcher-guide/best-practices', '316'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/researcher-guide/overview',
                component: ComponentCreator('/docs/researcher-guide/overview', '957'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/researcher-guide/setup',
                component: ComponentCreator('/docs/researcher-guide/setup', '70f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/researcher-guide/tracking-experiments',
                component: ComponentCreator('/docs/researcher-guide/tracking-experiments', '557'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/researcher-guide/training',
                component: ComponentCreator('/docs/researcher-guide/training', '3f2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/argocd',
                component: ComponentCreator('/docs/tools/argocd', '75e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/cassandra',
                component: ComponentCreator('/docs/tools/cassandra', '05a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/cicd',
                component: ComponentCreator('/docs/tools/cicd', 'e47'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/databases',
                component: ComponentCreator('/docs/tools/databases', 'b2b'),
                exact: true
              },
              {
                path: '/docs/tools/db-overview',
                component: ComponentCreator('/docs/tools/db-overview', '231'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/docker',
                component: ComponentCreator('/docs/tools/docker', '83a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/dynamodb',
                component: ComponentCreator('/docs/tools/dynamodb', '033'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/gpu-scheduling',
                component: ComponentCreator('/docs/tools/gpu-scheduling', 'e8d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/helm',
                component: ComponentCreator('/docs/tools/helm', 'a79'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/influxdb',
                component: ComponentCreator('/docs/tools/influxdb', 'f2d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/kubernetes',
                component: ComponentCreator('/docs/tools/kubernetes', '6b6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/memcached',
                component: ComponentCreator('/docs/tools/memcached', '83f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/message-queues',
                component: ComponentCreator('/docs/tools/message-queues', '89a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/minio',
                component: ComponentCreator('/docs/tools/minio', '1d1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/mlflow',
                component: ComponentCreator('/docs/tools/mlflow', 'a7c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/mongodb',
                component: ComponentCreator('/docs/tools/mongodb', '01a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/monitoring',
                component: ComponentCreator('/docs/tools/monitoring', 'ece'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/mysql',
                component: ComponentCreator('/docs/tools/mysql', '856'),
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
                component: ComponentCreator('/docs/tools/postgres', 'f58'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/prometheus',
                component: ComponentCreator('/docs/tools/prometheus', '8e3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/tools/redis',
                component: ComponentCreator('/docs/tools/redis', 'd33'),
                exact: true,
                sidebar: "tutorialSidebar"
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
