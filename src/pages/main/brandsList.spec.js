import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin     from '../../plugins/api/request';

import brandsList        from 'drive-templates/build/brandsList';
import { getEndpoint }   from '../../api/config';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin
    ],

    brands: {
        request: {
            url: getEndpoint('brands')
        }
    },

    brandsList: {
        create: {
            module: brandsList,
            args: [
                {$ref: 'brands'}
            ]
        }
    }

}