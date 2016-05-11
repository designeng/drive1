import _ from 'underscore';
import pluck from './utils/pluck';

import wireDebugPlugin from 'essential-wire/source/debug';

import { getEndpoint } from './config/api';

import brandsData from './config/brands';
import categories from './config/categories';

import helpers from './utils/handlebars/helpers';

export default {
    $plugins: [
        wireDebugPlugin,
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