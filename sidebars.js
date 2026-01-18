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
          ],
        },
        {
          type: 'category',
          label: 'Data Management',
          collapsed: true,
          items: [
            'tools/minio',
            'tools/postgres',
            'tools/databases',
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
      ],
    },
  ],
};

export default sidebars;
