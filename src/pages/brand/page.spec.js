import wireDebugPlugin      from 'essential-wire/source/debug';
import performancePlugin    from '../../plugins/performance';
import requestPlugin        from '../../plugins/api/request';

import { getEndpoint }   from '../../config/api';
import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        performancePlugin,
        requestPlugin
    ],

    // endpoint: /items/cars/{brand}/models
    brandModelsEndpoint: {
        create: {
            module: (brand) => {
                return getEndpoint('brandModels', {brand: brand.id});
            },
            args: [
                {$ref: 'brand'}
            ]
        }
    },

    brandModelsData: {
        request: {
            endpoint: {$ref: 'brandModelsEndpoint'}
        }
    },

    // endpoint: /items/test_drives/{brand}
    testDrivesEndpoint: {
        create: {
            module: (brand) => {
                return getEndpoint('brandTestDrives', {brand: brand.id});
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

    // endpoint: /items/news?brand={brand}
    brandNewsEndpoint: {
        create: {
            module: (brand) => {
                return [getEndpoint('news'), {brand: brand.id}];
            },
            args: [
                {$ref: 'brand'}
            ]
        }
    },

    brandNewsData: {
        request: {
            endpoint: {$ref: 'brandNewsEndpoint'}
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'brandModelsData'},
                {$ref: 'testDrivesData'},
                {$ref: 'brandNewsData'},
                {$ref: 'brand'},
                {$ref: 'getCarcassFn'}
            ]
        }
    }
}