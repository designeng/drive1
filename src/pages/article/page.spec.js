import wireDebugPlugin from 'essential-wire/source/debug';
import requestPlugin from '../../plugins/api/request';

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

    votingEndpoint: {
        create: {
            module: (cookies, nodeId) => {
                return [getEndpoint('voting'), {voter_id: cookies.userid, item_id: nodeId}];
            },
            args: [
                {$ref: 'cookies'},
                {$ref: 'nodeId'}
            ]
        }
    },

    votingData: {
        request: {
            endpoint: {$ref: 'votingEndpoint'},
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'articleData'},
                {$ref: 'votingData'},
                {$ref: 'getCarcassFn'},
            ]
        }
    }
}