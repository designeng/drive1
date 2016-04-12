import wireDebugPlugin      from 'essential-wire/source/debug';
import requestPlugin        from '../../plugins/api/request';

import { getEndpoint }   from '../../config/api';
import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin
    ],

    newsData: {
        request: {
            endpoint: getEndpoint('news'),
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'newsData'},
                {$ref: 'getCarcassFn'},
            ]
        }
    }
}