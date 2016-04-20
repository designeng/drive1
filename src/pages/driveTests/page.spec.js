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

    // endpoint: /items/test_drives?brand={brand}
    testDrivesEndpoint: {
        create: {
            module: (brand) => {
                return brand ? getEndpoint('brandTestDrives', {brand: brand.id}) : getEndpoint('testDrives');
            },
            args: [
                {$ref: 'brand'}
            ]
        }
    },

    testDrivesData: {
        request: {
            endpoint: {$ref: 'testDrivesEndpoint'}
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'brandsData'},
                {$ref: 'testDrivesData'},
                {$ref: 'testDrivesEndpoint'},
                {$ref: 'brand'},
                {$ref: 'getCarcassFn'},
            ]
        }
    }
}