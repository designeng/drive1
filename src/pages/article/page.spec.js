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

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'articleRequest'},
                {$ref: 'articleId'},
                {$ref: 'getCarcassFn'},
            ]
        }
    }
}