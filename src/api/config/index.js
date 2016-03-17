const config = {
    protocol: 'https',
    host: 'dev.drive.ru',
    baseDir: 'api',
    version: 'v1'
}

function getBaseUrl() {
    return config.protocol + '://' + config.host + '/' + config.baseDir + '/' + config.version
}

export default config;

export function getNewsUrl() {
    return getBaseUrl() + '/items/news';
}

export function getPageTemplateUrl() {
    return getBaseUrl() + '/static/pages/carcass';
}

export function getNewsBlockTemplateUrl() {
    return getBaseUrl() + '/static/blocks/news_item';
}