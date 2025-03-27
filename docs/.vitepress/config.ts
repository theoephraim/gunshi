import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Gunshi',
  description: 'Modern JavaScript Command-line library',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['meta', { name: 'theme-color', content: '#468c56' }],
    // TODO: og
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Gunshi | Modern javascript command-line library' }],
    ['meta', { property: 'og:image', content: 'https://gunshi.dev/og-image.png' }],
    ['meta', { property: 'og:site_name', content: 'Gunshi' }],
    ['meta', { property: 'og:url', content: 'https://gunshi.dev/' }]
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/symbol.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction/what-is-gunshi' },
      { text: 'Showcase', link: '/showcase' },
      { text: 'GitHub', link: 'https://github.com/kazupon/gunshi' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        collapsed: false,
        items: [
          { text: "What's Gunshi?", link: '/guide/introduction/what-is-gunshi' },
          { text: 'Setup', link: '/guide/introduction/setup' }
        ]
      },
      {
        text: 'Essentials',
        collapsed: false,
        items: [
          { text: 'Getting Started', link: '/guide/essentials/getting-started' },
          {
            text: 'Declarative Configuration',
            link: '/guide/essentials/declarative-configuration'
          },
          { text: 'Type Safe', link: '/guide/essentials/type-safe' },
          { text: 'Composable', link: '/guide/essentials/composable' },
          { text: 'Lazy & Async', link: '/guide/essentials/lazy-async' },
          { text: 'Auto Usage Generation', link: '/guide/essentials/auto-usage-generation' },
          { text: 'Internationalization', link: '/guide/essentials/internationalization' }
        ]
      },
      {
        text: 'Advanced',
        collapsed: false,
        items: [
          { text: 'Custom Usage Generation', link: '/guide/advanced/custom-usage-generation' },
          { text: 'Documentation Generation', link: '/guide/advanced/documentation-generation' },
          { text: 'Translation Adapter', link: '/guide/advanced/translation-adapter' }
        ]
      },
      {
        text: 'Showcase',
        link: '/showcase'
      }
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/kazupon/gunshi' }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 kazuya kawaguchi.'
    }
  },

  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    }
  },

  vite: {
    plugins: [groupIconVitePlugin()]
  }
})
