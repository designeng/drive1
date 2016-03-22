import _ from 'underscore';
import chalk from 'chalk';

import pageContent          from 'drive-templates/build/pages/news';

import itemCompact          from 'drive-templates/build/itemCompact';

const newsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemCompact(item);
        return result;
    }, '');
}

const composePageContentHtml = (newsData) => {
    return pageContent({
        newsItems: newsHtml(newsData)
    })
}

function controller(newsData, getCarcassFn) {

    console.log(chalk.green("newsData:::::", newsData));

    let pageContentHtml = composePageContentHtml(
        newsData
    );

    return {
        html: getCarcassFn(pageContentHtml)
    }
}

export default controller;