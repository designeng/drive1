import wireDebugPlugin      from 'essential-wire/source/debug';
import requestPlugin        from '../../../plugins/api/request';

import { getEndpoint }   from '../../../config/api';
import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
    ],

    brandModelData: {
        request: {
            endpoint: getEndpoint('brandModel'),
        }
    },

    // /items/test_drives?brand={brandName}
    testDrivesBrandEndpoint: {
        create: {
            module: (brandName) => {
                return [getEndpoint('testDrives'), {brand: brandName}]
            },
            args: [
                {$ref: 'brand.name'}
            ]
        }
    },

    testDrivesBrandData: {
        request: {
            endpoint: {$ref: 'testDrivesBrandEndpoint'},
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'brandModelData'},
                {$ref: 'testDrivesBrandData'},
                {$ref: 'getCarcassFn'},
            ]
        }
    }
}