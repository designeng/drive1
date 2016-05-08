import wireDebugPlugin from 'essential-wire/source/debug';
import requestPlugin from '../../../../plugins/api/request';

import { getEndpoint } from '../../../../config/api';
import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin
    ],

    modelConfigurationEndpoint: {
        create: {
            module: (carConfiguration) => {
                return getEndpoint('modelConfiguration', carConfiguration)
            },
            args: [
                {$ref: 'carConfiguration'}
            ]
        }
    },

    modelConfigurationData: {
        request: {
            endpoint: {$ref: 'modelConfigurationEndpoint'}
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'modelConfigurationData'},
                {$ref: 'getCarcassFn'}
            ]
        }
    }
}