import _ from 'underscore';

import pageContent from '../../templates/build/pages/news';
import itemCompact from '../../templates/build/itemCompact';

const newsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemCompact(item);
        return result;
    }, '');
}

const composePageContentHtml = (newsData, brand) => {
    return pageContent({
        newsItems: newsHtml(newsData),
        brand
    });
}

function controller(newsData, brand, getCarcassFn) {

    let pageContentHtml = composePageContentHtml(
        newsData,
        brand
    );

    return {
        html: getCarcassFn(pageContentHtml)
    };
}

export default controller;

// import Logger from '../../utils/logger';
// let logger = new Logger({file: __dirname + '../../../../log/articleData.log'});
// logger.info(articleData);