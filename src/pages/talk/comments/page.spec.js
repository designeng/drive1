import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin        from '../../../plugins/api/request';

import { getEndpoint } from '../../../config/api';

import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
    ],

    commentsPageEndpoint: {
        create: {
            module: (articleId) => {
                let rawEndpoint = getEndpoint('commentsPage', {id: articleId}, {mode: 'raw'});
                return [rawEndpoint, {raw: true}];
            },
            args: [
                {$ref: 'articleId'},
            ]
        }
    },

    commentsPageData: {
        request: {
            endpoint: {$ref: 'commentsPageEndpoint'},
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'commentsPageData'},
                {$ref: 'getCarcassFn'}
            ]
        }
    }
}