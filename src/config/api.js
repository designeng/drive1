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
    topVideos               : "/items/top_videos",
    numbers                 : "/content/numbers",
    special                 : "/content/special",
    brands                  : "/static/brands",
    cities                  : "/static/cities",
    news                    : "/items/news",
    testDrives              : "/items/test_drives",
    dealers                 : "/items/companies",
    video                   : "/items/videos",

    brandModels             : "/items/cars/{brand}/models",
    brandModel              : "/items/cars/{brand}/models/{year}/{model}",
    brandModelComplectation : "/items/cars/{brand}/models/{year}/{model}/{complectation}",
    // TODO: to rest:
    article         : "/item"
}

function getBaseUrl() {
    return config.protocol + '://' + config.host + '/' + config.baseDir + '/' + config.version
}

export default config;

export function getEndpoint(item, replacement) {
    let fragmentRegex = /{(.*?)}/g,
        urlRest;

    if(!endpoints[item]) {
        throw new Error('No such endpoint: ' + item);
    } else {
        urlRest = endpoints[item];
    }

    if(replacement) {
        let matches = urlRest.match(fragmentRegex);
        if(matches) {
            urlRest = _.reduce(matches, (result, item) => {
                result = result.replace(item, replacement[item.slice(1).slice(0, -1)]);
                return result;
            }, urlRest);
        }
    }
    
    return getBaseUrl() + urlRest;
}