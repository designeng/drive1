import _ from 'underscore';
import providePlugin from '../../plugins/api/provide';
import { getEndpoint }   from '../../api/config';

// const request = (resolver, compDef, wire) => {
//     setTimeout(() => {
//         resolver.resolve({e: 2}); 
//     }, 1000);
// }

// export default function requestPlugin(options) {
//     return {
//         factories: {
//             request
//         }
//     }
// }

export default function transformPlugin(options) {
    const transform = (resolver, facet, wire) => {
        let target = facet.target;
        let method = facet.options;

        resolver.resolve(method(target));
    }

    return {
        facets: {
            transform: {
                'ready:before': transform
            }
        }
    }
}

const doSmth = (x) => {
    return _.extend(x, {a: 1234567});
}

const view = (data) => {
    console.log("DATA::", data.length);
    return "PAGE:" + JSON.stringify(data)
    // return "PAGE:...." 
}

export default {
    $plugins: [
        providePlugin,
        transformPlugin
    ],
    
    data: {
        request: {
            endpoint: getEndpoint('topStories'),
            what: 'topNews'
        },
        transform: doSmth
    },

    body: {
        create: {
            module: view,
            args: [
                {$ref: 'data'}
            ]
        }
    }

}