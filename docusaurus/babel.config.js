/* eslint-env node */
/* eslint-disable no-undef */
module.exports = {
  presets: [require.resolve('@docusaurus/core/lib/babel/preset')],
  plugins: [
    [
      'babel-plugin-styled-components',
      {
        ssr: true,
        displayName: true,
        fileName: true,
        minify: true,
        transpileTemplateLiterals: true,
        pure: true,
      },
    ],
  ],
}
