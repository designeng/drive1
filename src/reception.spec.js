import wireDebugPlugin from 'essential-wire/source/debug';
import requestPlugin from './plugins/api/request';

import { getEndpoint } from './config/api';

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
            module: (userProfileData, targetUrl) => {
                return userProfileData;
            },
            args: [
                {$ref: 'userProfileData'},
                {$ref: 'targetUrl'},
            ]
        }
    }
}