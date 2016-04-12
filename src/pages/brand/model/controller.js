import _ from 'underscore';
import chalk from 'chalk';

import pageContent from '../../../templates/build/pages/model';

const getNews = (items) => {
    return _.map(items, (item) => {
        return item.caption.replace(/\{(.*?)\}/, function(match, aText) {
            return '<a href="' + item.url + '">' + aText + '</a>';
        })
    });
}

const composePageContentHtml = (brandModelData, testDrivesBrandData, brandNewsData) => {

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

        newsItems       : getNews(brandNewsData),


        // testDrives: 
    })
}

function controller(brandModelData, testDrivesBrandData, brandNewsData, getCarcassFn) {
    let pageContentHtml = composePageContentHtml(brandModelData, testDrivesBrandData, brandNewsData);

    return {
        html: getCarcassFn(pageContentHtml)
    }
}

export default controller;

// console.log(chalk.green("brandModelData:::::", brandModelData));