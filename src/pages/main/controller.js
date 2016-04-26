import _ from 'underscore';
import chalk from 'chalk';

import preprocessCaption from '../../utils/preprocessCaption';

import pageContent          from '../../templates/build/pages/main';

// TODO: rename template?
import itemLarge            from '../../templates/build/itemLarge';
import itemMedium           from '../../templates/build/itemMedium';
import itemCompact          from '../../templates/build/itemCompact';

// TODO: rename template?
import videoThumbnail       from '../../templates/build/videoThumbnail';
import blogEntry            from '../../templates/build/blogEntry';

// TODO: refactor to DRY
const largeNewsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        if ((items.indexOf(item) + 1) % 2 === 0) {
            item.shadowClass = 'ncard-shl';
        } else {
            item.shadowClass = 'ncard-shr';
        }

        result = result + itemLarge(item);
        return result;
    }, '');
}

const mediumNewsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemMedium(item);
        return result;
    }, '');
}

const mainNewsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemCompact(item);
        return result;
    }, '');
}

const topVideosHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + videoThumbnail(item);
        return result;
    }, '');
}

const topBlogsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + blogEntry(item);
        return result;
    }, '');
}

const composePageContentHtml = (topNews, mainNews, topVideos, topBlogs, cellar) => {
    return pageContent({
        topNews: largeNewsHtml(topNews.slice(0, 2)) + mediumNewsHtml(topNews.slice(2)),
        mainNews: mainNewsHtml(mainNews),
        topVideos: topVideosHtml(topVideos),
        topBlogs: topBlogsHtml(topBlogs),
        suggestedReading: cellar
    })
}

function controller(topStories, topVideos, topBlogs, cellar, getCarcassFn) {

    let topNews     = preprocessCaption(topStories['topNews'], {mode: 'text'});
    let mainNews    = preprocessCaption(topStories['mainNews'], {mode: 'link'});

    let pageContentHtml = composePageContentHtml(
        topNews,
        mainNews,
        topVideos,
        topBlogs,
        cellar
    );

    return {
        html: getCarcassFn(pageContentHtml)
    }
}

export default controller;