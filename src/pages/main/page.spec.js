import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin     from '../../plugins/api/request';
import performancePlugin from '../../plugins/performance';

import deferWire         from '../../decorators/deferWire';
import provide           from '../../decorators/provide';

import { getEndpoint }   from '../../api/config';
import { getPage, getBody } from '../common/page';
import controller from './controller';

import itemCompact          from 'drive-templates/build/itemCompact';
import itemLarge            from 'drive-templates/build/itemLarge';
import itemMedium           from 'drive-templates/build/itemMed';


export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
        performancePlugin
    ],

    @provide({
        endpoint: getEndpoint('topStories'), 
        what: 'topNews'
    })
    topNews: [itemLarge, 2, itemMedium, 4],

    // requests
    // topStories: {
    //     request: {
    //         url: getEndpoint('topStories'),

    //         // topNews
    //         // mainNews
    //     }
    // },

    // topVideos: {
    //     request: {
    //         url: getEndpoint('topVideos'),
    //     }
    // },

    // topBlogs: {
    //     request: {
    //         url: getEndpoint('topBlogs'),
    //     }
    // },

    // numbers: {
    //     request: {
    //         url: getEndpoint('numbers'),
    //     }
    // },
    // end requests

    // @deferWire({spec: brandsList})
    // brandsList: {},

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
                {$ref: 'topNews'}
            ]
        }
    }
}