import _ from 'underscore';
import chalk from 'chalk';

import Logger from '../../utils/logger';

import moment from 'moment';

moment.locale('ru');

import pageContent          from '../../templates/build/pages/brand';
import itemLarge            from '../../templates/build/itemLarge';
import itemMedium           from '../../templates/build/itemMedium';
import itemCompact          from '../../templates/build/itemCompact';
import carIcon              from '../../templates/build/carIcon';
import dealersList          from '../../templates/build/dealersList';
import dealerItem           from '../../templates/build/dealerItem';
import blogEntriesList      from '../../templates/build/blogEntriesList';
import blogEntry            from '../../templates/build/blogEntry';

const carIconsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + carIcon(item);
        return result;
    }, '');
};

const largeItemsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemLarge(item);
        return result;
    }, '');
};

const mediumItemsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemMedium(item);
        return result;
    }, '');
};

const newsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemCompact(item);
        return result;
    }, '');
}

const composePageContentHtml = (carIconsData, testDrivesData, brandNewsData, brand) => {

    return pageContent({
        testDrives: largeItemsHtml(testDrivesData.slice(0, 1)) + mediumItemsHtml(testDrivesData.slice(1, 9)),
        carIcons: carIconsHtml(carIconsData),
        newsItems: newsHtml(brandNewsData),
        brand
    });
};

function controller(carIconsData, testDrivesData, brandNewsData, brand, getCarcassFn) {
    let logger = new Logger({file: __dirname + '../../../../log/brandNewsData.log'});
    logger.info(brandNewsData);

    let pageContentHtml = composePageContentHtml(carIconsData, testDrivesData, brandNewsData, brand);

    return {
        html: getCarcassFn(pageContentHtml)
    };
}

export default controller;