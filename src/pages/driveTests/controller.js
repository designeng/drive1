import _ from 'underscore';

import pageContent          from '../../templates/build/pages/testDrives';
import brandFilter          from '../../templates/build/brandFilter';
import itemLarge            from '../../templates/build/itemLarge';
import itemMedium           from '../../templates/build/itemMedium';

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

    let pageContentHtml = composePageContentHtml(
        brandFilterData,
        testDrivesData
    );

    return {
        html: getCarcassFn(pageContentHtml)
    }
}

export default controller;