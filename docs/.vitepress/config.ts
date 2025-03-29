import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import typedocSidebar from '../api/typedoc-sidebar.json' with { type: 'json' }

type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (
  x: infer I
) => void
  ? I
  : never
type LastOf<U> =
  UnionToIntersection<U extends unknown ? () => U : never> extends () => infer R ? R : never
type UnionToTuple<T, L = LastOf<T>> = [T] extends [never] ? [] : [...UnionToTuple<Exclude<T, L>>, L]
type ThemeConfig = NonNullable<Parameters<typeof defineConfig>[0]['themeConfig']>
type SidebarItems = UnionToTuple<NonNullable<ThemeConfig['sidebar']>>[0]

function normalizeSidebarItems(items: SidebarItems): SidebarItems {
  return items.map(item => {
    const mapped = { ...item }
    if (item.link) {
      const splied = item.link.split('/docs')
      mapped.link = splied[1] || item.link
    }
    if (item.items) {
      mapped.items = normalizeSidebarItems(item.items) as typeof item.items
    }
    return mapped
  })
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Gunshi',
  description: 'Modern JavaScript Command-line library',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['meta', { name: 'theme-color', content: '#468c56' }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }],
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
      { text: 'API', link: '/api' },
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
        text: 'API References',
        collapsed: false,
        items: normalizeSidebarItems(typedocSidebar)
      },
      {
        text: 'Extra Topics',
        collapsed: false,
        items: [
          {
            text: 'Showcase',
            link: '/showcase'
          },
          {
            text: 'Credits',
            link: '/credits'
          }
        ]
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
