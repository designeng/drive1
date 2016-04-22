import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin        from '../../plugins/api/request';

import { getRawEndpoint } from '../../config/api';

import controller from './controller';

export default {
    $plugins: [
        // wireDebugPlugin,
        requestPlugin,
    ],

    companiesPageEndpoint: {
        create: {
            module: (cityId) => {
                return [getRawEndpoint('companiesPage'), {city: cityId, raw: true}];
            },
            args: [
                {$ref: 'cityId'}
            ]
        }
    },

    companiesPageData: {
        request: {
            endpoint: {$ref: 'companiesPageEndpoint'},
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'companiesPageData'},
                {$ref: 'getCarcassFn'}
            ]
        }
    }
}