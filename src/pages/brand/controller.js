import _ from 'underscore';
import chalk from 'chalk';

import moment from 'moment';
moment.locale('ru');

import pageContent          from 'drive-templates/build/pages/brand';
import itemLarge            from 'drive-templates/build/itemLarge';
import itemMedium           from 'drive-templates/build/itemMedium';
import itemCompact          from 'drive-templates/build/itemCompact';
import carIcon              from 'drive-templates/build/carIcon';
import dealersList          from 'drive-templates/build/dealersList';
import dealerItem           from 'drive-templates/build/dealerItem';
import blogEntriesList      from 'drive-templates/build/blogEntriesList';
import blogEntry            from 'drive-templates/build/blogEntry';

const largeItemsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemLarge(item);
        return result;
    }, '');
}

const mediumItemsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemMedium(item);
        return result;
    }, '');
}

const composePageContentHtml = (brandFilterData, testDrivesData) => {
    return pageContent({
        testDrives: largeItemsHtml(testDrivesData.slice(0, 2)) + mediumItemsHtml(testDrivesData.slice(2, 14)),
    })
}

function controller(brandFilterData, testDrivesData, getCarcassFn) {
    let pageContentHtml = composePageContentHtml(
        brandFilterData,
        testDrivesData
    );

    return {
        html: getCarcassFn(pageContentHtml)
    }
}

export default controller;