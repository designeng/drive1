import _ from 'underscore';

import wireDebugPlugin      from 'essential-wire/source/debug';
import performancePlugin    from '../../plugins/performance';
import providePlugin        from '../../plugins/api/provide';
import transformPlugin      from '../../plugins/transform';

import deferWire         from '../../decorators/deferWire';
// import provide from '../../decorators/provide';

import { getEndpoint }   from '../../api/config';
import { getPage, getBody } from '../common/page';
import controller from './controller';

import itemCompact          from 'drive-templates/build/itemCompact';
import itemLarge            from 'drive-templates/build/itemLarge';
import itemMedium           from 'drive-templates/build/itemMed';

const markupNews = () => {

}

var crop = function(x) {
    return x.slice(0, 2)
}

export default function arrangePlugin(options) {
    const arrange = (resolver, facet, wire) => {
        let target = facet.target;
        facet.target.html = "SOME HTML";

        resolver.resolve(facet.target);
    }

    return {
        facets: {
            arrange: {
                'ready:after': arrange
            }
        }
    }
}

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

    // page: {
    //     create: {
    //         module: getPage,
    //         args: [
    //         ]
    //     }
    // },

    // body: getBody(),

    body: {
        create: {
            module: controller,
            args: [
                {$ref: 'topStoriesRequest'},
                {$ref: 'topVideosRequest'},
                {$ref: 'topBlogsRequest'},
                {$ref: 'cellarRequest'},
            ]
        },
        arrange: {

        }
    }
}