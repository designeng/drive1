import wireDebugPlugin      from 'essential-wire/source/debug';
import requestPlugin        from '../../plugins/api/request';

import { getEndpoint, getArticleEndpoint } from '../../config/api';
import controller from './controller';

export default {
    $plugins: [
        // wireDebugPlugin,
        requestPlugin,
    ], 

    articleEndpoint: {
        create: {
            module: (articleId) => {
                return getEndpoint('article', {id: articleId})
            },
            args: [
                {$ref: 'articleId'}
            ]
        }
    },

    articleData: {
        request: {
            endpoint: {$ref: 'articleEndpoint'},
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'articleData'},
                {$ref: 'articleId'},
                {$ref: 'getCarcassFn'},
            ]
        }
    }
}