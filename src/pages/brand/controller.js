import _ from 'underscore';
import chalk from 'chalk';

import preprocessCaption from '../../utils/preprocessCaption';

import pageContent from '../../templates/build/pages/brand';
import itemLarge from '../../templates/build/itemLarge';
import itemMedium from '../../templates/build/itemMedium';
import itemCompact from '../../templates/build/itemCompact';
import testDrivePlaceholder from '../../templates/build/testDrivePlaceholder';
import testDrivePlaceholderLarge from '../../templates/build/testDrivePlaceholderLarge';
import carIcon from '../../templates/build/carIcon';
import dealersList from '../../templates/build/dealersList';
import dealerItem from '../../templates/build/dealerItem';
import blogEntriesList from '../../templates/build/blogEntriesList';
import blogEntry from '../../templates/build/blogEntry';

const MIN_TEST_DRIVES_NUMBER = 3;

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
    let testDrivePlaceholders = [];

    if (testDrivesData.length === 0) {
        testDrivePlaceholders = testDrivePlaceholderLarge();
    } else if (testDrivesData.length < MIN_TEST_DRIVES_NUMBER) {
        testDrivePlaceholders = Array(MIN_TEST_DRIVES_NUMBER - testDrivesData.length).fill(testDrivePlaceholder()).join('');

    }

    return pageContent({
        testDrives: largeItemsHtml(testDrivesData.slice(0, 1)) + mediumItemsHtml(testDrivesData.slice(1, 9)) + testDrivePlaceholders,
        testDrivePlaceholderLarge: testDrivePlaceholderLarge(),
        carIcons: carIconsHtml(carIconsData),
        newsItems: newsHtml(brandNewsData),
        brand
    });
};

function controller(carIconsData, testDrivesData, brandNewsData, brand, getCarcassFn) {
    testDrivesData = preprocessCaption(testDrivesData, {mode: 'text'});
    brandNewsData = preprocessCaption(brandNewsData, {mode: 'link'});
    let pageContentHtml = composePageContentHtml(carIconsData, testDrivesData, brandNewsData, brand);

    return {
        html: getCarcassFn(pageContentHtml)
    };
}

export default controller;