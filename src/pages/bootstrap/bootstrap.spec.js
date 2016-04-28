import wireDebugPlugin      from 'essential-wire/source/debug';
import requestPlugin        from '../../plugins/api/request';

import { getEndpoint }   from '../../config/api';
import getCarcassFn from './getCarcassFn';

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

    getCarcassFn: {
        create: {
            module: getCarcassFn,
            args: [
                {$ref: 'brandsData'},
                {$ref: 'citiesData'},
            ]
        }
    }
}