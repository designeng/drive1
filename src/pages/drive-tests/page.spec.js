import wireDebugPlugin      from 'essential-wire/source/debug';
import performancePlugin    from '../../plugins/performance';
import requestPlugin        from '../../plugins/api/request';

import { getEndpoint }   from '../../api/config';
import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        performancePlugin,
        requestPlugin,
    ],

    testDrivesRequest: {
        request: {
            endpoint: getEndpoint('testDrives'),
        }
    },

    // TODO: the same endpoint brandsRequest
    brandFilterRequest: {
        request: {
            endpoint: getEndpoint('brands'),
        }
    },

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

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'brandFilterRequest'},
                {$ref: 'testDrivesRequest'},
                {$ref: 'brandsRequest'},
                {$ref: 'citiesRequest'},
            ]
        }
    }
}