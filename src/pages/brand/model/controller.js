import _ from 'underscore';
import chalk from 'chalk';

import pageContent  from '../../../templates/build/pages/model';
import itemPlain    from '../../../templates/build/itemPlain';
import dealersList  from '../../../templates/build/dealersList';
import dealerItem   from '../../../templates/build/dealerItem';

const getNewsArray = (items) => {
    return _.map(items, (item) => {
        return {
            caption: item.caption.replace(/\{(.*?)\}/, function(match, aText) {
                return '<a href="' + item.url + '">' + aText + '</a>';
            })
        }
    });
}

const getNews = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemPlain(item);
        return result;
    }, '');
}

const getDealersList = (dealersData) => {
    let dealersItems = _.reduce(dealersData.payers, (result, item) => {
        result = result + dealerItem(item);
        return result;
    }, '');

    return dealersList({
        dealersItems,
        totalCompaniesCount: dealersData.totalCompaniesCount
    })
}

const composePageContentHtml = (brandModelData, testDrivesBrandData, brandNewsData, dealersData, city) => {

    let newsItems = getNews(getNewsArray(brandNewsData));
    let dealersList = getDealersList(dealersData);

    return pageContent({
        brand           : brandModelData.brand,   
        caption         : brandModelData.caption,
        description     : brandModelData.description,
        imageUrl        : brandModelData.imageUrl,
        carIcon         : brandModelData.carIcon,
        ncap            : brandModelData.ncap,
        gallery         : brandModelData.gallery,
        configurations  : brandModelData.configurations,
        similar         : brandModelData.similar,
        experience      : brandModelData.experience,
        d2Cars          : brandModelData.d2Cars,

        city            : city,

        newsItems,
        dealersList,

        // testDrives: 
    })
}

function controller(brandModelData, testDrivesBrandData, brandNewsData, dealersData, city, getCarcassFn) {
    let pageContentHtml = composePageContentHtml(brandModelData, testDrivesBrandData, brandNewsData, dealersData, city);

    return {
        html: getCarcassFn(pageContentHtml)
    }
}

export default controller;

// console.log(chalk.green("brandModelData:::::", brandModelData));