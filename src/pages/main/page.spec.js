import _ from 'underscore';
import chalk from 'chalk';

import wireDebugPlugin      from 'essential-wire/source/debug';
import performancePlugin    from '../../plugins/performance';
import providePlugin        from '../../plugins/api/provide';
import transformPlugin      from '../../plugins/transform';

import deferWire         from '../../decorators/deferWire';
// import provide from '../../decorators/provide';

import { getEndpoint }   from '../../api/config';
import { getPage, getBody } from '../common/page';
import controller from './controller';

const markupNews = () => {

}

var crop = function(x) {
    return x.slice(0, 2)
}

export default function arrangePlugin(options) {
    const arrange = (resolver, facet, wire) => {
        let target = facet.target;

        let top2 = facet.target.topNews.slice(0, 2)
        // let medium4 = facet.target.topNews.slice(2)

        let LargeNewsHtml = _.reduce(top2, (result, item) => {
            result = result + itemLarge(item);
            return result;
        }, '');

        console.log(chalk.green("LargeNewsHtml:::",LargeNewsHtml));

        facet.target.html = LargeNewsHtml

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
        // arrange: {

        // }
    }
}