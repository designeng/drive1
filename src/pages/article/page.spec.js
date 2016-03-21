import wireDebugPlugin      from 'essential-wire/source/debug';
import requestPlugin        from '../../plugins/api/request';

import { getEndpoint, getArticleEndpoint } from '../../config/api';
import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
    ], 

    articleRequest: {
        request: {
            endpoint: [getEndpoint('article'), "/", {$ref: 'articleId'}],
        }
    },

    brandsRequest: {
        request: {
            endpoint: getEndpoint('brands'),
        }
    },

    citiesRequest: {
        request: {
            endpoint: getEndpoint('cities'),
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'articleRequest'},
                {$ref: 'brandsRequest'},
                {$ref: 'citiesRequest'},
                {$ref: 'articleId'},
            ]
        }
    }
}