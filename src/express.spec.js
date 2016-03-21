import _  from 'underscore';
import pluck  from './utils/pluck';

import wireDebugPlugin      from 'essential-wire/source/debug';
import expressAppPlugin     from './plugins/express/application';
import expressRoutingMiddlewarePlugin from './plugins/express/routing';
import webpackMiddlewarePlugin        from './plugins/express/webpack/middleware';

import articlePageSpec      from './pages/article/page.spec';

import webpackConfig        from '../webpack.config';

import { getEndpoint }      from './config/api';
import requestPlugin        from './plugins/api/request';
import categories           from './config/categories';

import routes from './routes';

export default {
    $plugins: [
        // wireDebugPlugin,
        requestPlugin,
        expressAppPlugin,
        webpackMiddlewarePlugin,
        expressRoutingMiddlewarePlugin
    ],

    // TODO: should be api endpoint?
    categories: _.keys(categories),

    brandsRequest: {
        request: {
            endpoint: getEndpoint('brands')
        }
    },

    articlePage: {
        wire: {
            spec: articlePageSpec,
            defer: true
        }
    },

    brands: {
        create: {
            module: pluck,
            args: [
                {$ref: 'brandsRequest'},
                'id'
            ]
        }
    },

    app: {
        expressApplication: true,
        webpackMiddleware: {
            webpackConfig: webpackConfig
        },
        routeMiddleware: {
            routes: routes
        },
        articlePageMiddleware: {
            fragments: [
                {bounds: {$ref: 'categories'}},
                {bounds: {$ref: 'brands'}, require: false},
                {bounds: /([a-zA-Z0-9\.])+(.html|.htm)$/}
            ],
            articlePage: {$ref: 'articlePage'}
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