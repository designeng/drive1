import _ from 'underscore';
import chalk from 'chalk';

import wireDebugPlugin      from 'essential-wire/source/debug';
import performancePlugin    from '../../plugins/performance';
import providePlugin        from '../../plugins/api/provide';
import transformPlugin      from '../../plugins/transform';

import { getEndpoint }   from '../../api/config';
import { getPage, getBody } from '../common/page';
import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        performancePlugin,
        providePlugin,
        transformPlugin,
        arrangePlugin
    ],

    topStoriesRequest: {
        request: {
            endpoint: getEndpoint('topStories'),
        }
    },

    topVideosRequest: {
        request: {
            endpoint: getEndpoint('topVideos'),
        }
    },

    topBlogsRequest: {
        request: {
            endpoint: getEndpoint('topBlogs'),
        }
    },

    cellarRequest: {
        request: {
            endpoint: getEndpoint('numbers'),
        }
    },

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'topStoriesRequest'},
                {$ref: 'topVideosRequest'},
                {$ref: 'topBlogsRequest'},
                {$ref: 'cellarRequest'},
            ]
        }
    }
}