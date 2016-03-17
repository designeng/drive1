import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin     from '../../plugins/api/request';

import { getEndpoint }   from '../../api/config';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin
    ],

    brandsList: {
        request: {
            url: getEndpoint('brands')
        }
    },

}