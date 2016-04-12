import wireDebugPlugin      from 'essential-wire/source/debug';
import requestPlugin        from '../../../plugins/api/request';

import { getEndpoint }   from '../../../config/api';
import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
    ],

    brandModelEndpoint: {
        create: {
            module: (carModel) => {
                return getEndpoint('brandModel', carModel)
            },
            args: [
                {$ref: 'carModel'}
            ]
        }
    },

    brandModelData: {
        request: {
            endpoint: {$ref: 'brandModelEndpoint'},
        }
    },

    // /items/test_drives?brand={brandName}
    testDrivesBrandEndpoint: {
        create: {
            module: (carModel) => {
                return [getEndpoint('testDrives'), {brand: carModel.brand}]
            },
            args: [
                {$ref: 'carModel'}
            ]
        }
    },

    testDrivesBrandData: {
        request: {
            endpoint: {$ref: 'testDrivesBrandEndpoint'},
        }
    },

    // /items/news?brand={brandName} 
    brandNewsEndpoint: {
        create: {
            module: (carModel) => {
                return [getEndpoint('news'), {brand: carModel.brand}]
            },
            args: [
                {$ref: 'carModel'}
            ]
        }
    },

    brandNewsData: {
        request: {
            endpoint: {$ref: 'brandNewsEndpoint'},
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'brandModelData'},
                {$ref: 'testDrivesBrandData'},
                {$ref: 'brandNewsData'},
                {$ref: 'getCarcassFn'}
            ]
        }
    }
}