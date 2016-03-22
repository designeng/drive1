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

    videoRequest: {
        request: {
            endpoint: getEndpoint('video'),
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'videoRequest'},
                {$ref: 'brandsRequest'},
                {$ref: 'getCarcassFn'},
            ]
        }
    }
}