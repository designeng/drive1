import _ from 'underscore';
import chalk from 'chalk';

import utmEnrich from '../../../../utils/utmEnrich.js';

import pageContent from '../../../../templates/build/pages/configuration';
import optionCheckbox from '../../../../templates/build/partials/optionCheckbox';

import registerPartials from '../../../../utils/handlebars/registerPartials';

registerPartials({
    optionCheckbox
});

const composePageContentHtml = (modelConfigurationData) => {

    return pageContent({
        brand: modelConfigurationData.brand
    });
};

function controller(modelConfigurationData, getCarcassFn) {
    let pageContentHtml = composePageContentHtml(modelConfigurationData);

    return {
        html: getCarcassFn(pageContentHtml)
    }
}

export default controller;