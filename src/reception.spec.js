import wireDebugPlugin   from 'essential-wire/source/debug';
import requestPlugin     from './plugins/api/request';

import { getEndpoint }   from './config/api';

export default {
    $plugins: [
        wireDebugPlugin,
        requestPlugin,
    ],

    userProfileData: {
        request: {
            endpoint: getEndpoint('userProfile'),
            params: {
                access_token: {$ref: 'accessToken'}
            }
        }
    },

    controller: {
        create: {
            module: (response, userProfileData, targetUrl) => {
                return userProfileData;
                response.cookie('userid', userProfileData.userid);
                response.cookie('login', userProfileData.login);
                response.cookie('email', userProfileData.email);
                response.cookie('targetUrl', targetUrl);

                // return response.redirect(targetUrl);
            },
            args: [
                {$ref: 'response'},
                {$ref: 'userProfileData'},
                {$ref: 'targetUrl'},
            ]
        }
    }
}