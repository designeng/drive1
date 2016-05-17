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
import blogEntry from '../../templates/build/blogEntry';
import compareBlock from '../../templates/build/compareBlock';

const MIN_TEST_DRIVES_NUMBER = 3;

const carIconsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + carIcon(item);
        return result;
    }, '');
};

const largeItemsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        if (items.indexOf(item) === 0) {
            item.shadowClass = 'ncard-shl';
        }

        result = result + itemLarge(item);
        return result;
    }, '');
};

const mediumItemsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        if ((items.indexOf(item) + 1) % 2 !== 0) {
            item.shadowClass = 'ncard-shl';
        }

        result = result + itemMedium(item);
        return result;
    }, '');
};

const newsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemCompact(item);
        return result;
    }, '');
};

const composePageContentHtml = (carIconsData, testDrivesData, brandNewsData, brand) => {
    let testDrivePlaceholders = [];

    if (testDrivesData.length === 0) {
        testDrivePlaceholders = testDrivePlaceholderLarge();
    } else if (testDrivesData.length % 2 === 0) {
        testDrivePlaceholders = testDrivePlaceholder();
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
    let seo = {
        title: brand.name + ': цены, комплектации, тест-драйвы, отзывы, форум, фото, видео — ДРАЙВ',
        keywords: brand.name + ', купить ' + brand.name +  ", " + brand.name + ' цена, ' +
            brand.name + ' комплектация, купить ' + brand.name + ' в Москве' + ', новый ' +
            brand.name + ', ' + brand.name + ' фото, ' + brand.name + ' видео, ' + brand.name +
            ' отзывы владельцев, официальный дилер ' + brand.name,
        description: 'Выберите новый ' + brand.name +
            ' на ДРАЙВЕ. Цены, комплектации, тест-драйвы, фото и отзывы реальных владельцев. Купите у официального дилера ' +
            brand.name + ' в Москве'
    };

    return {
        html: getCarcassFn(pageContentHtml, {
            optionalBlocks: {
                compareBlock: compareBlock()
            },
            seo: seo
        })
    };
}

export default controller;