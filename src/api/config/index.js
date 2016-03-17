const config = {
    protocol: 'https',
    host: 'dev.drive.ru',
    baseDir: 'api',
    version: 'v1'
}

const endpoints = {
    numbers: "/content/numbers",
    special: "/content/special",
    brands:  "/content/brands",
    news:   "/items/news",
    testDrives: "/items/test_drives",
    topStories: "/items/top_stories",
    topBlogs: "/items/top_blogs",
}

function getBaseUrl() {
    return config.protocol + '://' + config.host + '/' + config.baseDir + '/' + config.version
}

export default config;

export function getEndpoint(item) {
    return getBaseUrl() + endpoints[item];
}