import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin     from '../../plugins/api/request';
import performancePlugin from '../../plugins/performance';
import Handlebars        from 'handlebars';

import { getEndpoint }   from '../../api/config';
import { getPage, getBody } from '../common/page';
import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
        performancePlugin
    ],

    // requests
    topStories: {
        request: {
            url: getEndpoint('topStories'),
        }
    },

    topVideos: {
        request: {
            url: getEndpoint('topVideos'),
        }
    },

    topBlogs: {
        request: {
            url: getEndpoint('topBlogs'),
        }
    },

    numbers: {
        request: {
            url: getEndpoint('numbers'),
        }
    },
    // end requests

    page: {
        create: {
            module: getPage,
            args: [
            ]
        }
    },

    body: getBody(),

    controller: {
        create: {
            module: controller,
            args: [
                {$ref: 'topStories'}
            ]
        }
    }
}