import wireDebugPlugin      from 'essential-wire/source/debug';
import expressAppPlugin     from './plugins/express/application';
import expressRoutingMiddlewarePlugin from './plugins/express/routing';
import webpackMiddlewarePlugin        from './plugins/express/webpack/middleware';

import webpackConfig        from '../webpack.config';

import routes from './routes';

export default {
    $plugins: [
        // wireDebugPlugin,
        expressAppPlugin,
        webpackMiddlewarePlugin,
        expressRoutingMiddlewarePlugin
    ],

    app: {
        expressApplication: true,
        webpackMiddleware: {
            webpackConfig: webpackConfig
        },
        routeMiddleware: {
            routes: routes,
            brands: {$ref: 'brands'}
        },
        articlePageMiddleware: {
            fragments: [
                {bounds: {$ref: 'categories'}},
                {bounds: {$ref: 'brands'}, require: false},
                {bounds: /([a-zA-Z0-9\.])+(.html|.htm)$/}
            ]
        },
        static: {
            dir: './public'
        },
        cssAssets: {
            main: './public/assets/global.css'
        },
        favicon: {
            path: './public/assets/favicon.ico'
        },
        // routeNotFoundMiddleware: {},
        server: {
            port            : process.env.PORT || 3000,
            verbose         : true
        }
    }
}