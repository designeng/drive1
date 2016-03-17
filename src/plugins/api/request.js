import axios from 'axios';
import _ from 'underscore';

function resolve(resolver, options, response) {
    let output = options.output;

    let property = output.property || 'data'
    if(!_.isString(property)) {
        throw new Error('[requestPlugin:] Property should be a string.');
    }
    response = response[property];

    if(output.skip) {
        response = _.filter(response, (item, index) => {
            return output.skip.indexOf(index) == -1;
        })
    }

    response = output && output.transform ? output.transform(response) : response;
    resolver.resolve(response);
}

function request(resolver, compDef, wire) {
    let url = compDef.options.url;
    let params = compDef.options.params;
    if (!url) {
        throw new Error('[requestPlugin:] Please set url to request factory.')
    }
    let method = compDef.options.method;
    const allowedMethods = ['get', 'delete', 'head', 'post', 'put', 'patch'];

    if(!method) {
        method = 'get'
    } else if(allowedMethods.indexOf(method) == -1) {
        throw new Error('Unknown method!');
    }

    axios[method](url, {
        params
    })
    .then(response => {
        resolve(resolver, compDef.options, response)
    })
    .catch(error => resolver.reject(error));
}

export default function requestPlugin(options) {
    return {
        factories: {
            request
        }
    }
}