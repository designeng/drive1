import wireDebugPlugin      from 'essential-wire/source/debug';
import expressAppPlugin     from './plugins/express/application';
import expressRoutingMiddlewarePlugin from './plugins/express/routing';
import webpackMiddlewarePlugin        from './plugins/express/webpack/middleware';

import webpackConfig        from '../webpack.config';

import routes from './routes';
import prevent from './prevent';

import findRemoveSync from'find-remove';
findRemoveSync('./log', {extensions: ['.log']});

export default {
    $plugins: [
        wireDebugPlugin,
        expressAppPlugin,
        webpackMiddlewarePlugin,
        expressRoutingMiddlewarePlugin
    ],

    app: {
        expressApplication: true,
        routeMiddleware: {
            routes: routes,
            prevent: prevent,
            logfile: './log/routeMiddleware.log',
        },
        articlePageMiddleware: {
            fragments: [
                {bounds: {$ref: 'categoryIds'}},
                {bounds: {$ref: 'brands'}, require: false},
                {bounds: /([a-zA-Z0-9\.])+(.html|.htm)$/}
            ],
            logfile: './log/articlePageMiddleware.log',
        },
        static: {
            dir: './public'
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