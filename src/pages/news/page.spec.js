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
            module: (brand, category) => {
                if(category) {
                    return [getEndpoint('news'), {category: category.id, count: 20}];
                }
                return brand ? [getEndpoint('news'), {brand: brand.id}] : getEndpoint('news');
            },
            args: [
                {$ref: 'brand'},
                {$ref: 'category'}
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
                {$ref: 'brand'},
                {$ref: 'category'},
                {$ref: 'newsData'},
                {$ref: 'getCarcassFn'},
            ]
        }
    }
}