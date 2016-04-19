import _ from 'underscore';

import pageContent from '../../templates/build/pages/news';
import itemCompact from '../../templates/build/itemCompact';

const newsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemCompact(item);
        return result;
    }, '');
}

const composePageContentHtml = (brand, category, newsData) => {
    return pageContent({
        brand,
        category,
        newsItems: newsHtml(newsData)
    });
}

function controller(brand, category, newsData, getCarcassFn) {

    let pageContentHtml = composePageContentHtml(brand, category, newsData);

    return {
        html: getCarcassFn(pageContentHtml)
    };
}

export default controller;

// import Logger from '../../utils/logger';
// let logger = new Logger({file: __dirname + '../../../../log/articleData.log'});
// logger.info(articleData);