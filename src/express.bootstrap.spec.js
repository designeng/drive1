import _  from 'underscore';
import pluck  from './utils/pluck';

import wireDebugPlugin      from 'essential-wire/source/debug';

import { getEndpoint }      from './config/api';
import requestPlugin        from './plugins/api/request';
import categories           from './config/categories';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin
    ],

    // TODO: should be api endpoint?
    categories: _.keys(categories),

    brandsData: {
        request: {
            endpoint: getEndpoint('brands')
        }
    },

    brands: {
        create: {
            module: pluck,
            args: [
                {$ref: 'brandsData'},
                'id'
            ]
        }
    },
}