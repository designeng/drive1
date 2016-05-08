import _ from 'underscore';

import pageContent from '../../templates/build/pages/videos';

import brandFilter from '../../templates/build/brandFilter';
import videoThumbnail from '../../templates/build/videoThumbnail';

const brandFilterHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + brandFilter(item);
        return result;
    }, '');
}

const videosHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + videoThumbnail(item);
        return result;
    }, '');
}

const composePageContentHtml = (videoData, brandFilterData) => {
    return pageContent({
        brandFilter: brandFilter({
            brands: brandFilterData
        }),
        brand: videoData.brand,
        videoItems: videosHtml(videoData),
    })
}

function controller(videoData, brandFilterData, getCarcassFn) {

    let pageContentHtml = composePageContentHtml(
        videoData,
        brandFilterData
    );

    return {
        html: getCarcassFn(pageContentHtml)
    }
}

export default controller;