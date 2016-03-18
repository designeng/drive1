import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin     from '../../plugins/api/request';
import _                 from 'underscore';

import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin
    ],

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'requestUrl'},
            ]
        }
    }
}