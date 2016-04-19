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

    // endpoint: /items/test_drives?brand={brandName}
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

    // endpoint: /items/news?brand={brandName} 
    brandNewsEndpoint: {
        create: {
            module: (carModel) => {
                return [getEndpoint('news'), {brand: carModel.brand, count: 3}]
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

    // should be recieved from city selector component. Default:
    city: {
        id      : 2191,
        name    : "Москва"
    },

    // endpoint: /items/companies?brand={brandName}&city={cityId}
    dealersEndpoint: {
        create: {
            module: (carModel, city) => {
                return [getEndpoint('dealers'), {brand: carModel.brand, city: city.id}]
            },
            args: [
                {$ref: 'carModel'},
                {$ref: 'city'}
            ]
        }
    },

    dealersData: {
        request: {
            endpoint: {$ref: 'dealersEndpoint'},
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'brandModelData'},
                {$ref: 'testDrivesBrandData'},
                {$ref: 'brandNewsData'},
                {$ref: 'dealersData'},
                {$ref: 'city'},
                {$ref: 'getCarcassFn'}
            ]
        }
    }
}