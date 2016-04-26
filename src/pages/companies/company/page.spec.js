import wireDebugPlugin      from 'essential-wire/source/debug';
import requestPlugin        from '../../../plugins/api/request';

import { getEndpoint }      from '../../../config/api';

import controller           from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
    ],

    companyPageEndpoint: {
        create: {
            module: (articleId) => {
                let rawEndpoint = getEndpoint('companyPage', {id: articleId}, {mode: 'raw'});
                return [rawEndpoint, {raw: true}];
            },
            args: [
                {$ref: 'articleId'},
            ]
        }
    },

    companyPageData: {
        request: {
            endpoint: {$ref: 'companyPageEndpoint'},
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'companyPageData'},
                {$ref: 'getCarcassFn'}
            ]
        }
    }
}