import axios from 'axios';
import _ from 'underscore';

function request(resolver, compDef, wire) {
    let endpoint = compDef.options.endpoint;
    let what = compDef.options.what;
    let params = compDef.options.params;

    if (!endpoint) {
        throw new Error('[providePlugin:] Please set endpoint to request factory.')
    }
    let method = compDef.options.method;
    const allowedMethods = ['get', 'delete', 'head', 'post', 'put', 'patch'];

    if(!method) {
        method = 'get'
    } else if(allowedMethods.indexOf(method) == -1) {
        throw new Error('[providePlugin:] Unknown method!');
    }

    axios[method](endpoint, {
        params
    })
    .then(response => {
        let result = what ? response.data[what] : response.data;
        resolver.resolve(result);
    })
    .catch(error => resolver.reject(error));
}

export default function providePlugin(options) {
    return {
        factories: {
            request
        }
    }
}