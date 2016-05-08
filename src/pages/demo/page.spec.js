import wireDebugPlugin from 'essential-wire/source/debug';
import requestPlugin from '../../plugins/api/request';
import performancePlugin from '../../plugins/performance';

import { preprocessNews, getPage } from './preprocessors';

import { getEndpoint } from '../../config/api';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
        performancePlugin
    ],

    newsData: {
        request: {
            url: getEndpoint('news'),
            params: {
                count: 8
            },
            output: {
                transform: preprocessNews
            }
        }
    },

    // TODO
    newsBlockTemplate: (x) => {return x},

    page: {
        create: {
            module: getPage,
            args: [
                {$ref: 'newsData'},
                {$ref: 'newsBlockTemplate'},
                {$ref: 'pageTemplate'}
            ]
        }
    }
}