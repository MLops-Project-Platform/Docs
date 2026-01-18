/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebars for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'getting-started/overview',
    'getting-started/quick-start',
    'repositories/overview',
    'repositories/mlops-platform',
    {
      type: 'category',
      label: 'Researcher Guide',
      collapsed: false,
      items: [
        'researcher-guide/overview',
        'researcher-guide/setup',
        'researcher-guide/training',
        'researcher-guide/tracking-experiments',
        'researcher-guide/best-practices',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      collapsed: false,
      items: [
        'development/mlops-workflow',
        'development/local-setup',
        'development/contributing',
      ],
    },
    {
      type: 'category',
      label: 'Tools & Infrastructure',
      collapsed: false,
      items: [
        'tools/overview',
        {
          type: 'category',
          label: 'Machine Learning Tools',
          collapsed: true,
          items: [
            'tools/mlflow',
          ],
        },
        {
          type: 'category',
          label: 'Infrastructure & Orchestration',
          collapsed: true,
          items: [
            'tools/docker',
            'tools/kubernetes',
            'tools/helm',
            'tools/argocd',
          ],
        },
        {
          type: 'category',
          label: 'GPU Scheduling',
          collapsed: true,
          items: [
            'tools/gpu-scheduling',
          ],
        },
        {
          type: 'category',
          label: 'Object Storage',
          collapsed: true,
          items: [
            'tools/minio',
          ],
        },
        {
          type: 'category',
          label: 'Databases',
          collapsed: true,
          items: [
            'tools/db-overview',
            {
              type: 'category',
              label: 'SQL Databases',
              collapsed: true,
              items: [
                'tools/postgres',
                'tools/mysql',
              ],
            },
            {
              type: 'category',
              label: 'NoSQL Databases',
              collapsed: true,
              items: [
                'tools/mongodb',
                'tools/cassandra',
                'tools/dynamodb',
              ],
            },
            {
              type: 'category',
              label: 'Caching Layer',
              collapsed: true,
              items: [
                'tools/redis',
                'tools/memcached',
              ],
            },
            {
              type: 'category',
              label: 'Time-Series Databases',
              collapsed: true,
              items: [
                'tools/influxdb',
                'tools/prometheus',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Message Queues & Event Streaming',
          collapsed: true,
          items: [
            'tools/message-queues',
          ],
        },
        {
          type: 'category',
          label: 'Monitoring & Observability',
          collapsed: true,
          items: [
            'tools/monitoring',
          ],
        },
        {
          type: 'category',
          label: 'CI/CD Pipelines',
          collapsed: true,
          items: [
            'tools/cicd',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
