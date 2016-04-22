import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin        from '../../plugins/api/request';

import { getEndpoint } from '../../config/api';

import controller from './controller';

export default {
    $plugins: [
        // wireDebugPlugin,
        requestPlugin,
    ],

    talkPageEndpoint: {
        create: {
            module: (brand) => {
                let rawEndpoint = brand ? getEndpoint('talkBrandPage', {brand: brand.id}, {mode: 'raw'}) : getEndpoint('talkPage', null, {mode: 'raw'});
                return [rawEndpoint, {raw: true}];
            },
            args: [
                {$ref: 'brand'},
            ]
        }
    },

    talkPageData: {
        request: {
            endpoint: {$ref: 'talkPageEndpoint'},
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'talkPageData'},
                {$ref: 'getCarcassFn'}
            ]
        }
    }
}