import _ from 'underscore';
import preprocessCaption from '../../utils/preprocessCaption';

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

    let pageContentHtml = composePageContentHtml(brand, category, preprocessCaption(newsData, {mode: 'link'}));

    return {
        html: getCarcassFn(pageContentHtml)
    };
}

export default controller;