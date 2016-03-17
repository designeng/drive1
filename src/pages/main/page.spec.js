import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin     from '../../plugins/api/request';
import performancePlugin from '../../plugins/performance';
import Handlebars        from 'handlebars';

import { getPage, getBody } from '../common/page';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
        performancePlugin
    ],

    page: {
        create: {
            module: getPage,
            args: [
            ]
        }
    },

    body: getBody()
}