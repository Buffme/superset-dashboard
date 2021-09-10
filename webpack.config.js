
 const fs = require('fs');
 const path = require('path');
 const webpack = require('webpack');
 const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
 const { CleanWebpackPlugin } = require('clean-webpack-plugin');
 const CopyPlugin = require('copy-webpack-plugin');
 const HtmlWebpackPlugin = require('html-webpack-plugin');
 const MiniCssExtractPlugin = require('mini-css-extract-plugin');
 const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
 const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
 const TerserPlugin = require('terser-webpack-plugin');
 const ManifestPlugin = require('webpack-manifest-plugin');
 const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
 const parsedArgs = require('yargs').argv;
 const getProxyConfig = require('./webpack.proxy-config');
 const packageConfig = require('./package.json');
 
 // input dir
 const APP_DIR = path.resolve(__dirname, './');
 // output dir
 const BUILD_DIR = path.resolve(__dirname, './dist');
 const ROOT_DIR = path.resolve(__dirname, '.');
 
 const {
   mode = 'development',
   devserverPort = 9000,
   measure = false,
   analyzeBundle = false,
   analyzerPort = 8888,
   nameChunks = false,
 } = parsedArgs;
 const isDevMode = mode !== 'production';
 const isDevServer = true;//process.argv[1].includes('webpack-dev-server');
 const ASSET_BASE_URL = process.env.ASSET_BASE_URL || '';
 
 const output = {
   path: BUILD_DIR,
   filename: "[name].bundle.js",
   publicPath: `${ASSET_BASE_URL}/`,
 };
//  if (isDevMode) {
//    output.filename = '[name].entry.js';
//    output.chunkFilename = '[name].chunk.js';
//  } else if (nameChunks) {
//    output.filename = '[name].entry.js';
//    output.chunkFilename = '[name].chunk.js';
//  } else {
//    output.filename = '[name].entry.js';
//    output.chunkFilename = '[name].chunk.js';
//  }
 
 const plugins = [
   
   // expose mode variable to other modules
   new webpack.DefinePlugin({
     'process.env.WEBPACK_MODE': JSON.stringify(mode),
   }),
 
   // runs type checking on a separate process to speed up the build
   new ForkTsCheckerWebpackPlugin({
     eslint: true,
     checkSyntacticErrors: true,
     memoryLimit: 4096,
   }),
 
   new CopyPlugin({
     patterns: [
       'package.json',
       { from: 'images', to: 'images' },
       { from: 'stylesheets', to: 'stylesheets' },
     ],
   }),
 
  //  // static pages
  //  new HtmlWebpackPlugin({
  //    template: './src/assets/staticPages/404.html',
  //    inject: true,
  //    chunks: [],
  //    filename: '404.html',
  //  }),
  //  new HtmlWebpackPlugin({
  //    template: './src/assets/staticPages/500.html',
  //    inject: true,
  //    chunks: [],
  //    filename: '500.html',
  //  }),

   new HtmlWebpackPlugin({
    template: "./public/index.html",
    filename: "index.html",
    inject: "body",
  }),
 ];
 
 if (!process.env.CI) {
   plugins.push(new webpack.ProgressPlugin());
 }
 
 // clean up built assets if not from dev-server
 if (!isDevServer) {
   plugins.push(
     new CleanWebpackPlugin({
       dry: false,
       // required because the build directory is outside the frontend directory:
       dangerouslyAllowCleanPatternsOutsideProject: true,
     }),
   );
 }
 
   plugins.push(
     new MiniCssExtractPlugin({
       filename: '[name].bundle.css',
      //  chunkFilename: '[name].chunk.css',
     }),
   );
   plugins.push(new OptimizeCSSAssetsPlugin());

 const babelLoader = {
   loader: 'babel-loader',
   options: {
     cacheDirectory: true,
     // disable gzip compression for cache files
     // faster when there are millions of small files
     cacheCompression: false,
     plugins: ['emotion'],
     presets: [
       [
         '@emotion/babel-preset-css-prop',
         {
           autoLabel: 'dev-only',
           labelFormat: '[local]',
         },
       ],
     ],
   },
 };
 
 const config = {
  //  node: {
  //    fs: 'empty',
  //  },
   entry: {
    index: "./src/views/index.tsx",
    //  preamble: PREAMBLE,
     theme: path.join(APP_DIR, '/src/theme.ts'),
    //  menu: addPreamble('src/views/menu.tsx'),
    //  spa: addPreamble('/src/views/index.tsx'),
    //  addSlice: addPreamble('/src/addSlice/index.tsx'),
    //  explore: addPreamble('/src/explore/index.jsx'),
    //  sqllab: addPreamble('/src/SqlLab/index.tsx'),
    //  profile: addPreamble('/src/profile/index.tsx'),
    //  showSavedQuery: [path.join(APP_DIR, '/src/showSavedQuery/index.jsx')],
   },
   output,
  //  stats: 'minimal',
   performance: {
     assetFilter(assetFilename) {
       // don't throw size limit warning on geojson and font files
       return !/\.(map|geojson|woff2)$/.test(assetFilename);
     },
   },
   optimization: {
     sideEffects: true,
    //  splitChunks: {
    //    chunks: 'all',
    //    // increase minSize for devMode to 1000kb because of sourcemap
    //    minSize: isDevMode ? 1000000 : 20000,
    //    name: nameChunks,
    //    automaticNameDelimiter: '-',
    //    minChunks: 2,
    //    cacheGroups: {
    //      automaticNamePrefix: 'chunk',
    //      // basic stable dependencies
    //      vendors: {
    //        priority: 50,
    //        name: 'vendors',
    //        test: new RegExp(
    //          `/node_modules/(${[
    //            'abortcontroller-polyfill',
    //            'react',
    //            'react-dom',
    //            'prop-types',
    //            'react-prop-types',
    //            'prop-types-extra',
    //            'redux',
    //            'react-redux',
    //            'react-hot-loader',
    //            'react-select',
    //            'react-sortable-hoc',
    //            'react-virtualized',
    //            'react-table',
    //            'react-ace',
    //            '@hot-loader.*',
    //            'webpack.*',
    //            '@?babel.*',
    //            'lodash.*',
    //            'antd',
    //            '@ant-design.*',
    //            '.*bootstrap',
    //            'moment',
    //            'jquery',
    //            'core-js.*',
    //            '@emotion.*',
    //            'd3',
    //            'd3-(array|color|scale|interpolate|format|selection|collection|time|time-format)',
    //          ].join('|')})/`,
    //        ),
    //      },
    //      // bundle large libraries separately
    //      mathjs: {
    //        name: 'mathjs',
    //        test: /\/node_modules\/mathjs\//,
    //        priority: 30,
    //        enforce: true,
    //      },
    //      // viz thumbnails are used in `addSlice` and `explore` page
    //      thumbnail: {
    //        name: 'thumbnail',
    //        test: /thumbnail(Large)?\.png/i,
    //        priority: 20,
    //        enforce: true,
    //      },
    //    },
    //  },
   },
   resolve: {
     modules: [APP_DIR, 'node_modules'],
     alias: {
       'react-dom': '@hot-loader/react-dom',
       // Force using absolute import path of some packages in the root node_modules,
       // as they can be dependencies of other packages via `npm link`.
       '@superset-ui/core': path.resolve(
         APP_DIR,
         './node_modules/@superset-ui/core',
       ),
       '@superset-ui/chart-controls': path.resolve(
         APP_DIR,
         './node_modules/@superset-ui/chart-controls',
       ),
     },
     extensions: ['.ts', '.tsx', '.js', '.jsx', '.yml'],
    //  symlinks: false,
   },
   context: APP_DIR, // to automatically find tsconfig.json
   module: {
     // Uglifying mapbox-gl results in undefined errors, see
     // https://github.com/mapbox/mapbox-gl-js/issues/4359#issuecomment-288001933
     noParse: /(mapbox-gl)\.js$/,
     rules: [
       {
         test: /datatables\.net.*/,
         loader: 'imports-loader?define=>false',
       },
       {
         test: /\.tsx?$/,
         exclude: [/\.test.tsx?$/],
         use: [
           'thread-loader',
           babelLoader,
           {
             loader: 'ts-loader',
             options: {
               // transpile only in happyPack mode
               // type checking is done via fork-ts-checker-webpack-plugin
               happyPackMode: true,
               transpileOnly: true,
               // must override compiler options here, even though we have set
               // the same options in `tsconfig.json`, because they may still
               // be overriden by `tsconfig.json` in node_modules subdirectories.
               compilerOptions: {
                 esModuleInterop: false,
                 importHelpers: false,
                 module: 'esnext',
                 target: 'esnext',
               },
             },
           },
         ],
       },
       {
         test: /\.jsx?$/,
         // include source code for plugins, but exclude node_modules and test files within them
         exclude: [/superset-ui.*\/node_modules\//, /\.test.jsx?$/],
         include: [
           new RegExp(`${APP_DIR}/src`),
           /superset-ui.*\/src/,
           new RegExp(`${APP_DIR}/.storybook`),
         ],
         use: [babelLoader],
       },
       {
         test: /\.css$/,
         include: [APP_DIR, /superset-ui.+\/src/],
         use: [
           isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader,
           {
             loader: 'css-loader',
             options: {
               sourceMap: isDevMode,
             },
           },
         ],
       },
       {
         test: /\.less$/,
         include: APP_DIR,
         use: [
           isDevMode ? 'style-loader' : MiniCssExtractPlugin.loader,
           {
             loader: 'css-loader',
             options: {
               sourceMap: isDevMode,
             },
           },
           {
             loader: 'less-loader',
             options: {
               sourceMap: isDevMode,
               javascriptEnabled: true,
             },
           },
         ],
       },
       /* for css linking images (and viz plugin thumbnails) */
       {
         test: /\.png$/,
         issuer: {
           exclude: /\/src\/assets\/staticPages\//,
         },
         loader: 'url-loader',
         options: {
           limit: 10000,
           name: '[name].[hash:8].[ext]',
         },
       },
       {
         test: /\.png$/,
         issuer: {
           test: /\/src\/assets\/staticPages\//,
         },
         loader: 'url-loader',
         options: {
           limit: 150000, // Convert images < 150kb to base64 strings
         },
       },
       {
         test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
         issuer: {
           test: /\.(j|t)sx?$/,
         },
         use: ['@svgr/webpack'],
       },
       {
         test: /\.(jpg|gif)$/,
         loader: 'file-loader',
         options: {
           name: '[name].[hash:8].[ext]',
         },
       },
       /* for font-awesome */
       {
         test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
         loader: 'url-loader?limit=10000&mimetype=application/font-woff',
         options: {
           esModule: false,
         },
       },
       {
         test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
         loader: 'file-loader',
         options: {
           esModule: false,
         },
       },
       {
         test: /\.ya?ml$/,
         include: ROOT_DIR,
         loader: 'js-yaml-loader',
       },
     ],
   },
   externals: {
     cheerio: 'window',
     'react/lib/ExecutionEnvironment': true,
     'react/lib/ReactContext': true,
   },
   plugins,
   devtool: 'source-map',
 };
 

  config.devServer = {
    port: 9000,
    open: true,
    hot: true,
    compress: true,
    stats: "errors-only",
    overlay: true,
  },
 
 
 
 module.exports = config;
 