// testDrives page!

import _ from 'underscore';
import chalk from 'chalk';

import moment from 'moment';
moment.locale('ru');

import pageContent          from 'drive-templates/build/pages/testDrives';

import brandFilter          from 'drive-templates/build/brandFilter';

import itemLarge            from 'drive-templates/build/itemLarge';
import itemMedium           from 'drive-templates/build/itemMedium';

// const preprocessNews = (items) => {
//     return _.map(items, (item) => {
//         return _.extend({}, item, {
//             time    : moment.unix(item.time).fromNow(),
//             caption : item.caption.replace(/\{(.*?)\}/, function(match, aText) {
//                 return '<a href="' + item.url + '">' + aText + '</a>';
//             })
//         });
//     });
// }

// TODO: refactor to DRY
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

const brandFilterHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + brandFilter(item);
        return result;
    }, '');
}

const testDrivesHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + brandFilter(item);
        return result;
    }, '');
}

const composePageContentHtml = (brandFilterData, testDrivesData) => {
    return pageContent({
        brandFilter: brandFilter({
            brands: brandFilterData
        }),
        testDrives: largeItemsHtml(testDrivesData.slice(0, 2)) + mediumItemsHtml(testDrivesData.slice(2, 14)),
    })
}

function controller(brandFilterData, testDrivesData, getCarcassFn) {

    // console.log(chalk.green("brands:::::", brands.data));

    let pageContentHtml = composePageContentHtml(
        brandFilterData,
        testDrivesData
    );

    return {
        html: getCarcassFn(pageContentHtml)
    }
}

export default controller;