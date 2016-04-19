import _ from 'underscore';
import chalk from 'chalk';

import Logger from '../../utils/logger';

import pageContent          from '../../templates/build/pages/news';

import itemCompact          from '../../templates/build/itemCompact';

const newsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemCompact(item);
        return result;
    }, '');
}

const composePageContentHtml = (newsData) => {
    return pageContent({
        newsItems: newsHtml(newsData)
    });
}

function controller(newsData, brand, getCarcassFn) {
    let logger = new Logger({file: __dirname + '../../../../log/newsData.log'});
    logger.info(newsData);

    let pageContentHtml = composePageContentHtml(
        newsData
    );

    return {
        html: getCarcassFn(pageContentHtml)
    };
}

export default controller;

// import Logger from '../../utils/logger';
// let logger = new Logger({file: __dirname + '../../../../log/articleData.log'});
// logger.info(articleData);