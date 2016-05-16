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
            module: (theme, talkFirstId, talkSecondId, talkCompanyId) => {
                let rawEndpoint;
                if(talkCompanyId) {
                    rawEndpoint = getEndpoint('talkCompanyPage', {talkCompanyId}, {mode: 'raw'});
                    return [rawEndpoint, {raw: true}];
                } else {
                    theme = theme ? theme.id : null;
                    rawEndpoint = getEndpoint('talkPage', {theme, talkFirstId, talkSecondId}, {mode: 'raw'});
                    return [rawEndpoint, {raw: true}];
                }
            },
            args: [
                {$ref: 'theme'},
                {$ref: 'talkFirstId'},
                {$ref: 'talkSecondId'},
                {$ref: 'talkCompanyId'},
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