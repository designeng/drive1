import wireDebugPlugin      from 'essential-wire/source/debug';
import requestPlugin        from '../../plugins/api/request';

import { getEndpoint, getArticleEndpoint } from '../../config/api';
import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
    ], 

    articleEndpoint: {
        create: {
            module: (nodeId) => {
                return getEndpoint('article', {id: nodeId})
            },
            args: [
                {$ref: 'nodeId'}
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
                {$ref: 'getCarcassFn'},
            ]
        }
    }
}