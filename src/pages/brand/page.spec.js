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
                return getEndpoint('brandModels', brand)
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

    testDrivesData: {
        request: {
            endpoint: getEndpoint('testDrives')
        }
    },

    modelsData: {
        request: {
            endpoint: getEndpoint('models')
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'modelsData'},
                {$ref: 'testDrivesData'},
                {$ref: 'brand'},
                {$ref: 'getCarcassFn'}
            ]
        }
    }
}