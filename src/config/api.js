import _ from 'underscore';

const config = {
    protocol: 'https',
    host: 'dev.drive.ru',
    baseDir: 'api',
    version: 'v1'
}

const endpoints = {
    topStories: "/items/top_stories",
    topBlogs: "/items/top_blogs",
    numbers: "/content/numbers",
    special: "/content/special",
    brands: "/static/brands",
    cities: "/static/cities",
    news: "/items/news",
    testDrives: "/items/test_drives",
    brandTestDrives: "/items/test_drives/{brand}",
    dealers: "/items/companies",
    video: "/items/videos",
    article: "/item/{id}",
    voting: "/system/verify_voter",
    brandModels: "/items/cars/{brand}/models",
    brandModel: "/items/cars/{brand}/models/{year}/{model}",
    modelConfiguration: "/items/cars/{brand}/models/{year}/{model}/{configuration}",
    // reception
    userProfile: "/system/user_profile",
    topControls: "/system/controls",
    // raw:
    companiesPage: "/companies/{brand}",
    companiesSectionPage: "/companies/{sectionFirstId}/{sectionSecondId}",
    companyPage: "/company/{id}.html",
    companyBlogPage: "/blog/company/{blogId}",
    talkPage: "/talk/{theme}/{talkFirstId}/{talkSecondId}",
    talkCompanyPage: "/talk/company/{talkCompanyId}",
    commentsPage: "/talk/comments/{id}.html",
    // TODO: is it thread?
    threadTalkPage: "/talk/{id}.html",
    sitesearch: "/sitesearch",
}

function getBaseUrl(options) {
    if(options && options.mode == 'raw') {
        return config.protocol + '://' + config.host;
    }

    return config.protocol + '://' + config.host + '/' + config.baseDir + '/' + config.version
}

export default config;

export function getEndpoint(item, replacement, options) {
    // for endpoints exeptions such as '/supercars/drive-test/2007/11/22/681054/nalyot_na_lyod.html'
    if(item.indexOf('/') != -1) {
        endpoint = getBaseUrl(options) + item;
        return endpoint;
    }

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