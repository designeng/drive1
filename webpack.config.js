// obsolete

var webpack = require('webpack');

var NODE_ENV = process.env.NODE_ENV;

module.exports = {
    context: __dirname + '/src',
    entry: {
        demoPage    : './client/index.js'
    },
    output: {
        filename: './public/build/[name].js'
    },
    module: {
        loaders: [
            {   
                test: /\.hbs/, 
                loader: "handlebars-template-loader", 
                exclude: /node_modules/ 
            },
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            }
        ]
    },
    node: {
        fs: "empty" // avoids error messages
    },
    plugins: [
        new webpack.EnvironmentPlugin('NODE_ENV'),
    ],
    devtool: 'source-map'
}