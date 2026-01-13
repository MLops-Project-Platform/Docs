// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MLOps Platform',
  tagline: 'Enterprise MLOps Infrastructure & Research Platform',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://mlops-platform.example.com',
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'MLops-Project-Platform',
  projectName: 'documentation',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl:
            'https://github.com/MLops-Project-Platform/documentation/tree/main/',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/MLops-Project-Platform/documentation/tree/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/mlops-social-card.jpg',
      navbar: {
        title: 'MLOps Platform Documentation',
        logo: {
          alt: 'MLOps Logo',
          src: 'img/twiml-mlops.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            href: 'https://github.com/MLops-Project-Platform',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/getting-started/overview',
              },
              {
                label: 'Architecture',
                to: '/docs/architecture/overview',
              },
              {
                label: 'Deployment',
                to: '/docs/deployment/docker',
              },
            ],
          },
          {
            title: 'Repositories',
            items: [
              {
                label: 'MLOps Platform',
                href: 'https://github.com/MLops-Project-Platform/mlops-platform',
              },
              {
                label: 'Helm Charts',
                href: 'https://github.com/MLops-Project-Platform/mlops-helm-charts',
              },
              {
                label: 'Research Template',
                href: 'https://github.com/MLops-Project-Platform/mlops-research-template',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub Issues',
                href: 'https://github.com/MLops-Project-Platform/issues',
              },
              {
                label: 'Discussions',
                href: 'https://github.com/MLops-Project-Platform/discussions',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} MLOps Platform. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'yaml', 'docker', 'python', 'json'],
      },
    }),
};

export default config;
