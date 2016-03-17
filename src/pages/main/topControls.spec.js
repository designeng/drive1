import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin     from '../../plugins/api/request';

import topControls       from 'drive-templates/build/topControls';
import { getEndpoint }   from '../../api/config';

const loginUrl = "";
const signupUrl = "";
const logoutUrl = "";

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin
    ],

    special: {
        request: {
            url: getEndpoint('special')
        }
    },
    // -> specialTitle

    topControls: {
        create: {
            module: topControls,
            args: [{
                loginUrl,
                signupUrl,
                logoutUrl
            }]
        }
    }

}