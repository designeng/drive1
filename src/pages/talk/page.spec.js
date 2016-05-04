import wireDebugPlugin from 'essential-wire/source/debug';
import requestPlugin from '../../plugins/api/request';

import { getEndpoint } from '../../config/api';

import controller from './controller';

export default {
    $plugins: [
        // wireDebugPlugin,
        requestPlugin,
    ],

    talkPageEndpoint: {
        create: {
            module: (theme, talkFirstId, talkSecondId) => {
                theme = theme ? theme.id : null;
                let rawEndpoint = getEndpoint('talkPage', {theme, talkFirstId, talkSecondId}, {mode: 'raw'});
                return [rawEndpoint, {raw: true}];
            },
            args: [
                {$ref: 'theme'},
                {$ref: 'talkFirstId'},
                {$ref: 'talkSecondId'},
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