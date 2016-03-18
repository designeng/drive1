import _ from 'underscore';

import wireDebugPlugin      from 'essential-wire/source/debug';
import performancePlugin    from '../../plugins/performance';
import requestPlugin        from '../../plugins/api/request';
import transformPlugin      from '../../plugins/transform';

import { getEndpoint }   from '../../api/config';
import { getPage, getBody } from '../common/page';
import controller from './controller';

export default {
    $plugins: [
        wireDebugPlugin,
        performancePlugin,
        requestPlugin,
        transformPlugin
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

    brandsRequest: {
        request: {
            endpoint: getEndpoint('brands'),
        }
    },

    citiesRequest: {
        request: {
            endpoint: getEndpoint('cities'),
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
                {$ref: 'brandsRequest'},
                {$ref: 'citiesRequest'},
            ]
        }
    }
}