import wireDebugPlugin      from 'essential-wire/source/debug';
import expressAppPlugin     from './plugins/express/application';
import expressRoutingMiddlewarePlugin from './plugins/express/routing';
import webpackMiddlewarePlugin        from './plugins/express/webpack/middleware';

import webpackConfig        from '../webpack.config';

import { getEndpoint }      from './config/api';
import requestPlugin        from './plugins/api/request';
import categories           from './config/categories';

import routes from './routes';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
        expressAppPlugin,
        webpackMiddlewarePlugin,
        expressRoutingMiddlewarePlugin
    ],

    // TODO: should be api endpoint?
    categories: categories,

    brands: {
        request: {
            endpoint: getEndpoint('brands')
        }
    },

    app: {
        expressApplication: true,
        webpackMiddleware: {
            webpackConfig: webpackConfig
        },
        routeMiddleware: {
            routes: routes,
            articlesRoutes: {
                fragment0: {$ref: 'categories'},
                fragment1: {
                    bounds: {$ref: 'brands'},
                    required: false
                },
                fragment2: /^\d+$\.html/,
            }
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
        routeNotFoundMiddleware: {},
        server: {
            port            : process.env.PORT || 3000,
            verbose         : true
        }
    }
}