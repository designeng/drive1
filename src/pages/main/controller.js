import _ from 'underscore';
import chalk from 'chalk';

import carcass              from 'drive-templates/build/carcass';
import head                 from 'drive-templates/build/head';
import body                 from 'drive-templates/build/body';

import citySelector         from 'drive-templates/build/citySelector';
import additionalNav        from 'drive-templates/build/additionalNav';
import bottomScripts        from 'drive-templates/build/bottomScripts';
import delimiter            from 'drive-templates/build/delimiter';
import description          from 'drive-templates/build/description';
import footer               from 'drive-templates/build/footer';
import header               from 'drive-templates/build/header';
import keywords             from 'drive-templates/build/keywords';
import logo                 from 'drive-templates/build/logo';
import mobileMenuTrigger    from 'drive-templates/build/mobileMenuTrigger';
import mobileNav            from 'drive-templates/build/mobileNav';
import nav                  from 'drive-templates/build/nav';
import sprContainer         from 'drive-templates/build/sprContainer';
import topControls          from 'drive-templates/build/topControls';
import brandsList           from 'drive-templates/build/brandsList';

import pageContent          from 'drive-templates/build/pages/main';

// TODO: rename template?
import itemLarge            from 'drive-templates/build/itemLarge';
import itemMedium           from 'drive-templates/build/itemMed';
import itemCompact          from 'drive-templates/build/itemCompact';

// TODO: rename template?
import videoThumbnail       from 'drive-templates/build/videoThumbnail';
import blogEntry            from 'drive-templates/build/blogEntry';

// TODO: refactor to DRY
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

const composePageContentHtml = (topNews, mainNews, topVideos, topBlogs, cellar) => {
    return pageContent({
        topNews: largeNewsHtml(topNews.slice(0, 2)) + mediumNewsHtml(topNews.slice(2)),
        mainNews: mainNewsHtml(mainNews),
        topVideos: topVideosHtml(topVideos),
        topBlogs: topBlogsHtml(topBlogs),
        suggestedReading: cellar
    })
}

const headerHtml = (cities) => {
    return header({
        topControls: topControls(),
        logo: logo(),
        citySelector: citySelector(cities),
        nav: nav()
    })
}

function controller(topStories, topVideos, topBlogs, cellar, brands, cities) {

    // console.log(chalk.green("brands:::::", brands.data));

    let topNews     = topStories.data['topNews']
    let mainNews    = topStories.data['mainNews']

    let pageContentHtml = composePageContentHtml(
        topNews,
        mainNews,
        topVideos.data,
        topBlogs.data,
        cellar.data
    );

    let html = carcass({
        htmlClass: '',
        head: head(),
        body: body({
            mobileMenuTrigger: mobileMenuTrigger(),
            header: headerHtml({
                cities: cities.data
            }),
            mobileNav: mobileNav(),
            additionalNav: additionalNav(),
            brandsList: brandsList({
                brands: brands.data
            }),
            page: pageContentHtml,
            footer: footer(),
            // TODO: should be helper?
            sprContainer: sprContainer(),
            bottomScripts: bottomScripts()
        })
    });

    return {
        html
    }
}

export default controller;