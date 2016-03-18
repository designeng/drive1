// testDrives page!

import _ from 'underscore';
import chalk from 'chalk';

import moment from 'moment';
moment.locale('ru');

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

import brandFilter          from 'drive-templates/build/brandFilter';

import pageContent          from 'drive-templates/build/pages/testDrives';

import itemLarge            from 'drive-templates/build/itemLarge';
import itemMedium           from 'drive-templates/build/itemMedium';

// const preprocessNews = (items) => {
//     return _.map(items, (item) => {
//         return _.extend({}, item, {
//             time    : moment.unix(item.time).fromNow(),
//             caption : item.caption.replace(/\{(.*?)\}/, function(match, aText) {
//                 return '<a href="' + item.url + '">' + aText + '</a>';
//             })
//         });
//     });
// }

// TODO: refactor to DRY
const largeItemsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemLarge(item);
        return result;
    }, '');
}

const mediumItemsHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + itemMedium(item);
        return result;
    }, '');
}

const brandFilterHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + brandFilter(item);
        return result;
    }, '');
}

const testDrivesHtml = (items) => {
    return _.reduce(items, (result, item) => {
        result = result + brandFilter(item);
        return result;
    }, '');
}

const composePageContentHtml = (brandFilter, testDrives) => {
    return pageContent({
        brandFilter: brandFilterHtml(brandFilter),
        testDrives: largeItemsHtml(testDrives.slice(0, 2)) + mediumItemsHtml(testDrives.slice(2, 14)),
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

function controller(brandFilter, testDrives, brands, cities) {

    // console.log(chalk.green("brands:::::", brands.data));

    let pageContentHtml = composePageContentHtml(
        brandFilter,
        testDrives
    );

    let html = carcass({
        htmlClass: '',
        head: head(),
        body: body({
            mobileMenuTrigger: mobileMenuTrigger(),
            header: headerHtml({
                cities
            }),
            mobileNav: mobileNav(),
            additionalNav: additionalNav(),
            brandsList: brandsList({
                brands
            }),
            page: pageContentHtml,
            footer: footer(),
            sprContainer: sprContainer(),
            bottomScripts: bottomScripts()
        })
    });

    return {
        html
    }
}

export default controller;