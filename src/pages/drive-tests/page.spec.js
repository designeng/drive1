import wireDebugPlugin      from 'essential-wire/source/debug';
import performancePlugin    from '../../plugins/performance';
import requestPlugin        from '../../plugins/api/request';

import { getEndpoint }   from '../../config/api';
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

    // TODO: the same endpoint brandsRequest?
    brandFilterRequest: {
        request: {
            endpoint: getEndpoint('brands'),
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'brandFilterRequest'},
                {$ref: 'testDrivesRequest'},
                {$ref: 'getCarcassFn'},
            ]
        }
    }
}