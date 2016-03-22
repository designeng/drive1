import wireDebugPlugin   from 'essential-wire/source/debug';

import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin
    ],

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'getCarcassFn'}
            ]
        }
    }
}