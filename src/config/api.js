import _  from 'underscore';

const config = {
    protocol: 'https',
    host: 'dev.drive.ru',
    baseDir: 'api',
    version: 'v1'
}

const endpoints = {
    topStories              : "/items/top_stories",
    topBlogs                : "/items/top_blogs",
    numbers                 : "/content/numbers",
    special                 : "/content/special",
    brands                  : "/static/brands",
    cities                  : "/static/cities",
    news                    : "/items/news",
    testDrives              : "/items/test_drives",
    brandTestDrives         : "/items/test_drives/{brand}",
    dealers                 : "/items/companies",
    video                   : "/items/videos",

    article                 : "/item/{id}",

    brandModels             : "/items/cars/{brand}/models",
    brandModel              : "/items/cars/{brand}/models/{year}/{model}",
    brandModelComplectation : "/items/cars/{brand}/models/{year}/{model}/{complectation}",

    // raw:
    companiesPage           : "/companies/{brand}",
    companyPage             : "/company/{id}.html",
    talkPage                : "/talk/{theme}/{talkFirstId}/{talkSecondId}",
    commentsPage            : "/talk/comments/{id}.html",
}

function getBaseUrl(options) {
    if(options && options.mode == 'raw') {
        return config.protocol + '://' + config.host;
    }

    return config.protocol + '://' + config.host + '/' + config.baseDir + '/' + config.version
}

export default config;

export function getEndpoint(item, replacement, options) {
    let fragmentRegex = /{(.*?)}/g,
        endpoint = endpoints[item];

    if(!endpoint) {
        throw new Error('No such endpoint: ' + item);
    }

    if(replacement) {
        let matches = endpoint.match(fragmentRegex);
        if(matches) {
            endpoint = _.reduce(matches, (result, item) => {
                let replaceWith = replacement[item.slice(1).slice(0, -1)];
                result = replaceWith ? result.replace(item, replaceWith) : result.replace(item, '');
                return result;
            }, endpoint);
        }
    }

    // TODO: test it
    // remove extra slashes from endpoint
    endpoint = endpoint.replace(/(\/{2})/g, '/');

    endpoint = getBaseUrl(options) + endpoint;
    
    return endpoint;
}