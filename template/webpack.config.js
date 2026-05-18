const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (options, webpack) => {
  const lazyImports = [
    // '@nestjs/microservices/microservices-module',
    // '@nestjs/websockets/socket-module',
    // '@nestjs/platform-express',
    // '@nestjs/platform-fastify',
    // '@fastify/view',
  ];

  return {
    ...options,
    entry: {
      main: './src/lambda.ts',
    },
    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
      filename: 'main.js',
    },
    devtool: false,
    plugins: [
      ...options.plugins,
      process.env.ANALYZE === 'true'
        ? new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        : null,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
    ],
  };
};
