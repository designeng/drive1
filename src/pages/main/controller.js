import _ from 'underscore';
import pageContent          from 'drive-templates/build/pages/main';

// TODO: rename templete?
import itemLarge            from 'drive-templates/build/itemLarge';
import itemMedium           from 'drive-templates/build/itemMed';
import itemCompact          from 'drive-templates/build/itemCompact';

// TODO: rename templete?
import videoThumbnail       from 'drive-templates/build/videoThumbnail';
import blogEntry            from 'drive-templates/build/blogEntry';

const largeNewsHtml = (items) => {
    return _.reduce(items, (result, item) => {
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

const composeToHtml = (topNews, mainNews, topVideos, topBlogs, cellar) => {
    return pageContent({
        topNews: largeNewsHtml(topNews.slice(0, 2)) + mediumNewsHtml(topNews.slice(2)),
        mainNews: mainNewsHtml(mainNews),
        topVideos: topVideosHtml(topVideos),
        topBlogs: topBlogsHtml(topBlogs),
        suggestedReading: cellar
    })
}

function controller(topStories, topVideos, topBlogs, cellar) {

    let topNews     = topStories.data['topNews']
    let mainNews    = topStories.data['mainNews']

    let html = composeToHtml(
        topNews,
        mainNews,
        topVideos,
        topBlogs,
        cellar.data
    )

    return {
        html
    }
}

export default controller;