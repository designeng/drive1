import wireDebugPlugin from 'essential-wire/source/debug';
import requestPlugin from '../../plugins/api/request';

import { getEndpoint } from '../../config/api';
import getCarcassFn from './getCarcassFn';

// TODO: get from NODE_ENV or config
// dev mode:
const port = 3000;
const host = "http://localhost:" + port;
// /dev mode

export default {
    $plugins: [
        // wireDebugPlugin,
        requestPlugin,
    ],

    brandsData: {
        request: {
            endpoint: getEndpoint('brands'),
        }
    },

    citiesData: {
        request: {
            endpoint: getEndpoint('cities'),
        }
    },

    receptionButtonsParams: {
        create: {
            module: (requestUrl) => {
                return {
                    target_url: host + requestUrl,
                    target_api: host + '/local_reception',
                    target_logout: host + '/logout',
                }
            },
            args: [
                {$ref: 'requestUrl'}
            ]
        }
    },

    receptionButtons: {
        request: {
            endpoint: getEndpoint('topControls'),
            params: {$ref: 'receptionButtonsParams'}
        }
    },

    getCarcassFn: {
        create: {
            module: getCarcassFn,
            args: [
                {$ref: 'brandsData'},
                {$ref: 'citiesData'},
                {$ref: 'receptionButtons'},
            ]
        }
    }
}