import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin     from '../../plugins/api/request';
import performancePlugin from '../../plugins/performance';
import Handlebars        from 'handlebars';

import { preprocessNews, getPage } from './preprocessors';

import { getEndpoint }   from '../../api/config';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
        performancePlugin
    ],

    news: {
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
                {$ref: 'news'},
                {$ref: 'newsBlockTemplate'},
                {$ref: 'pageTemplate'}
            ]
        }
    }
}