const config = {
    protocol: 'https',
    host: 'dev.drive.ru',
    baseDir: 'api',
    version: 'v1'
}

const endpoints = {
    topStories: "/items/top_stories",
    topBlogs: "/items/top_blogs",
    topVideos: "/items/top_videos",
    numbers: "/content/numbers",
    special: "/content/special",
    brands:  "/static/brands",
    cities: "/static/cities",
    news:   "/items/news",
    testDrives: "/items/test_drives",
    // TODO: to rest:
    article: "/item"
}

function getBaseUrl() {
    return config.protocol + '://' + config.host + '/' + config.baseDir + '/' + config.version
}

export default config;

export function getEndpoint(item) {
    if(!endpoints[item]) {
        throw new Error('No such endpoint: ' + item);
    }
    return getBaseUrl() + endpoints[item];
}