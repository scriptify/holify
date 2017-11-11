const path = require(`path`);
const webpack = require(`webpack`); // Da bundling modules!
const merge = require(`webpack-merge`); // Merge together configurations!
const cssnext = require(`postcss-cssnext`);
const atImport = require(`postcss-import`);
const HtmlWebpackExcludeAssetsPlugin = require(`html-webpack-exclude-assets-plugin`);
const HtmlWebpackPlugin = require(`html-webpack-plugin`);

const PATHS = {
  app: path.join(__dirname, `app`),
  build: path.join(__dirname, `build`),
  assets: path.join(__dirname, `assets`)
};

const TARGET = process.env.npm_lifecycle_event;

function createCommonConfiguration(appPath, buildPath) {
  return {
    entry: appPath,
    resolve: {
      extensions: [`.js`, `.jsx`] // Resolve these extensions
    },
    output: {
      path: buildPath,
      filename: `bundle.js`
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          include: [appPath],
          use: [
            {
              loader: `style-loader`
            },
            {
              loader: `css-loader`
            },
            {
              loader: `postcss-loader`,
              options: {
                plugins: () => [
                  atImport(),
                  cssnext()
                ]
              }
            }
          ]
        },
        {
          include: [appPath],
          test: /\.jsx?$/,
          use: [
            {
              loader: `babel-loader`,
              options: {
                cacheDirectory: true
              },
            }
          ]
        },
        {
          test: /\.(jpe?g|png|gif|svg|ttf|eot|woff|woff2)$/i,
          use: [
            {
              loader: `file-loader`,
              options: {
                hash: `sha512`,
                digest: `hex`,
                name: `[hash].[ext]`
              }
            },
            {
              loader: `image-webpack-loader`,
              options: {
                bypassOnDebug: true
              }
            }
          ],
          include: [appPath]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        ENVIRONMENT: JSON.stringify(TARGET === `start:dev` ? `development` : `production`)
      }),
      new webpack.LoaderOptionsPlugin({
        test: /\.(jpe?g|png|gif|svg)$/i,
        options: {
          imageWebpackLoader: {
            gifsicle: {
              interlaced: false
            },
            optipng: {
              optimizationLevel: 7
            }
          }
        }
      }),
      new HtmlWebpackPlugin({
        excludeAssets: [/\.min\.js$/],
        template: path.join(PATHS.assets, `index.html`)
      }),
      new HtmlWebpackExcludeAssetsPlugin()
    ]
  };
}

function createDevConfig(serveFrom) {
  return {
    devServer: {
      contentBase: serveFrom,
      historyApiFallback: true,
      hot: true,
      inline: true,
      stats: `errors-only`,
      host: `0.0.0.0`,
      https: false,
      disableHostCheck: true,
      proxy: [
        {
          context: [`/socket.io`],
          target: `http://192.168.43.139:3000/`
        }
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ],
    devtool: `eval-source-map`
  };
}

const PROD_CONFIG = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(`production`)
      }
    }),
    new webpack.optimize.UglifyJsPlugin()
  ],
  node: {
    fs: `empty`,
    net: `empty`,
    tls: `empty`
  }
};

const WEB_APP_CONFIG = {};

switch (TARGET) {
  case `start:dev:controller`:
    module.exports = merge(
      createCommonConfiguration(PATHS.app, PATHS.build),
      createDevConfig(PATHS.build),
      WEB_APP_CONFIG
    );
    break;

  case `start:prod:controller`:
    module.exports = merge(
      createCommonConfiguration(PATHS.app, PATHS.build),
      PROD_CONFIG,
      WEB_APP_CONFIG
    );
    break;
}
