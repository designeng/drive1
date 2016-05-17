import wireDebugPlugin from 'essential-wire/source/debug';
import requestPlugin from '../../plugins/api/request';

import { getEndpoint } from '../../config/api';

import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
    ],

    searchPageEndpoint: {
        create: {
            module: (queryString) => {
                return [getEndpoint('sitesearch', {}, {mode: 'raw'}), {queryString, raw: true}];
            },
            args: [
                {$ref: 'queryString'}
            ]
        }
    },

    searchPageData: {
        request: {
            endpoint: {$ref: 'searchPageEndpoint'},
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'searchPageData'},
                {$ref: 'getCarcassFn'},
            ]
        }
    }
}