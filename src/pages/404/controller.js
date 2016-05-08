import _ from 'underscore';

import carcass from '../../templates/build/carcass';
import head from '../../templates/build/head';
import body from '../../templates/build/body';

import citySelector from '../../templates/build/citySelector';
import additionalNav from '../../templates/build/additionalNav';
import bottomScripts from '../../templates/build/bottomScripts';
import description from '../../templates/build/description';
import footer from '../../templates/build/footer';
import header from '../../templates/build/header';
import keywords from '../../templates/build/keywords';
import logo from '../../templates/build/logo';
import mobileMenuTrigger from '../../templates/build/mobileMenuTrigger';

import mobileNav from '../../templates/build/mobileNav';
import nav from '../../templates/build/nav';
import topControls from '../../templates/build/topControls';
import brandsList from '../../templates/build/brandsList';

import brandFilter from '../../templates/build/brandFilter';

import pageContent from '../../templates/build/pages/testDrives';

const headerHtml = (cities) => {
    return header({
        topControls: topControls(),
        logo: logo(),
        citySelector: citySelector(cities),
        nav: nav()
    })
}

function controller(requestUrl) {

    let html = carcass({
        htmlClass: '',
        head: head(),
        body: body({
            mobileMenuTrigger: mobileMenuTrigger(),
            header: headerHtml({
            }),
            mobileNav: mobileNav(),
            additionalNav: additionalNav(),
            brandsList: brandsList({
            }),
            page: 'Страница ' + requestUrl + ' не найдена',
            footer: footer(),
            bottomScripts: bottomScripts()
        })
    });

    return {
        html
    }
}

export default controller;