var path = require('path');
var webpack = require('webpack');

// var NODE_ENV = process.env.NODE_ENV;

module.exports = {
    context: __dirname + '/src',
    entry: [
        'webpack-hot-middleware/client?reload=true',
        './client/index.js'
    ],
    // output: {
    //     filename: './public/build/[name].js',

    // },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/static/'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        // new webpack.EnvironmentPlugin('NODE_ENV'),
        new webpack.HotModuleReplacementPlugin(),
    ],
    devtool: 'source-map'
}