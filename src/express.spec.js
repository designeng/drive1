import wireDebugPlugin      from 'essential-wire/source/debug';
import expressAppPlugin     from './plugins/express/application';
import expressRoutingMiddlewarePlugin from './plugins/express/routing';
import webpackMiddlewarePlugin        from './plugins/express/webpack/middleware';

import webpackConfig        from '../webpack.config';

import routes from './routes';
import resolveRoutesConcurrency from './resolveRoutesConcurrency';

import findRemoveSync from'find-remove';
findRemoveSync('./log', {extensions: ['.log']});

const originApiHost = 'https://dev.drive.ru';

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
            before: resolveRoutesConcurrency,
            logfile: './log/routeMiddleware.log',
        },
        proxyMiddleware: {
            routes: [
                {url: '/api/feedback', originUrl: originApiHost + '/api.php', method: 'POST'},
            ]
        },
        articlePageMiddleware: {
            fragments: [
                {bounds: {$ref: 'categoryIds'}},
                {bounds: {$ref: 'brands'}, require: false},
                {bounds: /([a-zA-Z0-9\.])+(.html|.htm)$/}
            ]
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