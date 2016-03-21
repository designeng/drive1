import wireDebugPlugin      from 'essential-wire/source/debug';
import requestPlugin        from '../../plugins/api/request';

import { getEndpoint }   from '../../config/api';
import getCarcassFn from './getCarcassFn';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
    ],

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

    getCarcassFn: {
        create: {
            module: getCarcassFn,
            args: [
                {$ref: 'brandsRequest'},
                {$ref: 'citiesRequest'},
            ]
        }
    }
}