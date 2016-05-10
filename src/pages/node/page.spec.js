import wireDebugPlugin from 'essential-wire/source/debug';
import requestPlugin from '../../plugins/api/request';

import { getEndpoint } from '../../config/api';

import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
    ],

    pageEndpoint: {
        create: {
            module: (nodeId, endpoint) => {
                let rawEndpoint;

                if(!nodeId) {
                    return [getEndpoint(endpoint, {}, {mode: 'raw'}), {raw: true}];
                }

                rawEndpoint = getEndpoint(endpoint, { id: nodeId }, {mode: 'raw'});
                return [rawEndpoint, {raw: true}];
            },
            args: [
                {$ref: 'nodeId'},
                {$ref: 'endpoint'},
            ]
        }
    },

    pageData: {
        request: {
            endpoint: {$ref: 'pageEndpoint'},
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'pageData'},
                {$ref: 'getCarcassFn'},
                {$ref: 'additionalStyles'}
            ]
        }
    }
}