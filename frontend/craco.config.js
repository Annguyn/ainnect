const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@services': path.resolve(__dirname, 'src/services'),
    },
    configure: (webpackConfig) => {
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.ignoreWarnings = [
          /Failed to parse source map/,
          /Module not found/,
        ];
        if (webpackConfig.plugins) {
          const eslintPlugin = webpackConfig.plugins.find(
            plugin => plugin.constructor.name === 'ESLintWebpackPlugin'
          );
          if (eslintPlugin) {
            eslintPlugin.options.emitWarning = false;
            eslintPlugin.options.failOnWarning = false;
            eslintPlugin.options.failOnError = false;
          }
        }
      }
      return webpackConfig;
    },
  },
  eslint: {
    enable: process.env.NODE_ENV !== 'production',
    mode: 'file',
  },
};