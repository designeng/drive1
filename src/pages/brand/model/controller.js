import _ from 'underscore';
import chalk from 'chalk';

import pageContent from '../../../templates/build/pages/model';

const composePageContentHtml = (brandModelData) => {
    return pageContent({
        caption         : brandModelData.caption,
        description     : brandModelData.description,
        gallery         : brandModelData.gallery,
        similar         : brandModelData.similar,


        // testDrives: 
    })
}

function controller(brandModelData, testDrivesBrandData, getCarcassFn) {

    let pageContentHtml = composePageContentHtml(brandModelData);

    return {
        html: getCarcassFn(pageContentHtml)
    }
}

export default controller;