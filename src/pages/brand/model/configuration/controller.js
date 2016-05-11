import _ from 'underscore';
import chalk from 'chalk';

import utmEnrich from '../../../../utils/utmEnrich.js';

import pageContent from '../../../../templates/build/pages/configuration';
import optionCheckbox from '../../../../templates/build/partials/optionCheckbox';
import configurationOption from '../../../../templates/build/partials/configurationOption';
import compareBlock from '../../../../templates/build/compareBlock';

import registerPartials from '../../../../utils/handlebars/registerPartials';

registerPartials({
    optionCheckbox,
    configurationOption
});

const composePageContentHtml = (modelConfigurationData) => {

    return pageContent({
        brand: modelConfigurationData.brand,
        model: modelConfigurationData.model,
        caption: modelConfigurationData.caption,
        carInfo: modelConfigurationData.carInfo,
        price: modelConfigurationData.price,
        priceFormatted: modelConfigurationData.priceFormatted,
        id: modelConfigurationData.id,
        gallery: modelConfigurationData.gallery,
        packages: modelConfigurationData.packages,
        details: modelConfigurationData.details,
        other: modelConfigurationData.other
    });
};

function controller(modelConfigurationData, getCarcassFn) {
    let pageContentHtml = composePageContentHtml(modelConfigurationData);

    return {
        html: getCarcassFn(pageContentHtml, null, null, null, {compareBlock: compareBlock()})
    }
}

export default controller;