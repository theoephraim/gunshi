// @ts-check

/** @type {import('typedoc').TypeDocOptions & import('typedoc-plugin-markdown').PluginOptions & { docsRoot?: string } } */
export default {
  entryPoints: ['./src/index.ts', './src/generator.ts'],
  out: 'docs/api',
  plugin: ['typedoc-plugin-markdown', 'typedoc-vitepress-theme'],
  readme: 'none',
  docsRoot: './docs',
  entryFileName: 'index',
  hidePageTitle: true,
  useCodeBlocks: true,
  disableSources: true,
  indexFormat: 'table',
  parametersFormat: 'table',
  interfacePropertiesFormat: 'table',
  classPropertiesFormat: 'table',
  propertyMembersFormat: 'table',
  typeAliasPropertiesFormat: 'table',
  enumMembersFormat: 'table'
}
