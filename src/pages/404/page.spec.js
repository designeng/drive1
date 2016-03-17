import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin     from '../../plugins/api/request';
import performancePlugin from '../../plugins/performance';
import Handlebars        from 'handlebars';
import _                 from 'underscore';

import { 
    getPageTemplateUrl
} from '../../api/config';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
        performancePlugin
    ],

    pageTemplate: {
        request: {
            url: getPageTemplateUrl(),
            output: {
                transform: Handlebars.compile
            }
        }
    },

    page: {
        create: {
            module: (page, url) => {
                return page({ items:  'Страница ' + url + ' не найдена'});
            },
            args: [
                {$ref: 'pageTemplate'},
                {$ref: 'requestUrl'}
            ]
        }
    }
}