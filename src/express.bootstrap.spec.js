import _  from 'underscore';
import pluck  from './utils/pluck';

import wireDebugPlugin      from 'essential-wire/source/debug';

import { getEndpoint }      from './config/api';
import requestPlugin        from './plugins/api/request';

import brandsData           from './config/brands';
import categories           from './config/categories';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin
    ],

    categoryIds: _.map(categories, (item) => {return item.id}),

    brandsData: brandsData,

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