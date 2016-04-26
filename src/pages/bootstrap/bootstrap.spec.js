import wireDebugPlugin      from 'essential-wire/source/debug';
import requestPlugin        from '../../plugins/api/request';

import { getEndpoint }   from '../../config/api';
import getCarcassFn from './getCarcassFn';

import receptionUrl from './receptionUrl';

export default {
    $plugins: [
        // wireDebugPlugin,
        requestPlugin,
    ],

    receptionUrl: {
        create: {
            module: receptionUrl,
            args: [
                {$ref: 'requestUrl'}
            ]
        }
    }, 

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

    getCarcassFn: {
        create: {
            module: getCarcassFn,
            args: [
                {$ref: 'brandsData'},
                {$ref: 'citiesData'},
                {$ref: 'receptionUrl'},
            ]
        }
    }
}