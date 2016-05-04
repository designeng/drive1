import wireDebugPlugin from 'essential-wire/source/debug';
import performancePlugin from '../../plugins/performance';
import requestPlugin from '../../plugins/api/request';

import { getEndpoint } from '../../config/api';
import controller from './controller';

export default {
    $plugins: [
        // wireDebugPlugin,
        performancePlugin,
        requestPlugin,
    ],

    topStoriesData: {
        request: {
            endpoint: getEndpoint('topStories'),
        }
    },

    topVideosData: {
        request: {
            endpoint: [getEndpoint('video'), {top: true}],
        }
    },

    topBlogsData: {
        request: {
            endpoint: getEndpoint('topBlogs'),
        }
    },

    cellarData: {
        request: {
            endpoint: getEndpoint('numbers'),
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'topStoriesData'},
                {$ref: 'topVideosData'},
                {$ref: 'topBlogsData'},
                {$ref: 'cellarData'},
                {$ref: 'getCarcassFn'},
            ]
        }
    }
}