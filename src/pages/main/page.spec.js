import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin     from '../../plugins/api/request';
import performancePlugin from '../../plugins/performance';
import deferWire         from '../../decorators/deferWire';

import { getEndpoint }   from '../../api/config';
import { getPage, getBody } from '../common/page';
import controller from './controller';

import brandsList        from './brandsList.spec';

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

            // topNews
            // mainNews
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

    // defer
    @deferWire({spec: brandsList})
    brandsList: {},

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