import _ from 'underscore';
import chalk from 'chalk';

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

const carIconsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + carIcon(item);
        return result;
    }, '');
};

const composePageContentHtml = (carIconsData, testDrivesData) => {
    return pageContent({
        testDrives: largeItemsHtml(testDrivesData.slice(0, 2)) + mediumItemsHtml(testDrivesData.slice(2, 14)),
        carIcons: carIconsHtml(carIconsData)
    });
};

function controller(carIconsData, testDrivesData, getCarcassFn) {
    let pageContentHtml = composePageContentHtml(
        carIconsData,
        testDrivesData
    );

    return {
        html: getCarcassFn(pageContentHtml)
    };
}

export default controller;