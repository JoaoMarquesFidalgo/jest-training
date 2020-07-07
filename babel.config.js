module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ],
    '@babel/preset-typescript'
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    'babel-plugin-transform-typescript-metadata',
    ['module-resolver', {
      alias: {
        '@config': './src/config',
        '@models': './src/models',
        '@controllers': './src/controllers',
        '@services': './src/services',
        '@lib': './src/lib',
        '@routes': './src/routes',
        '@auth': './src/auth'
      }
    }]
  ],
  ignore: [
    '**/*.spec.ts'
  ]
}
