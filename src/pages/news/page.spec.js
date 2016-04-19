import wireDebugPlugin      from 'essential-wire/source/debug';
import requestPlugin        from '../../plugins/api/request';

import { getEndpoint }   from '../../config/api';
import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin
    ],

    newsEndpoint: {
        create: {
            module: (brand) => {
                return brand.id ? [getEndpoint('news'), {brand: brand.id}] : getEndpoint('news');
            },
            args: [
                {$ref: 'brand'}
            ]
        }
    },

    newsData: {
        request: {
            endpoint: {$ref: 'newsEndpoint'},
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'newsData'},
                {$ref: 'brand'},
                {$ref: 'getCarcassFn'},
            ]
        }
    }
}