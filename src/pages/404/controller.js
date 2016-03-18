import _ from 'underscore';

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
            sprContainer: sprContainer(),
            bottomScripts: bottomScripts()
        })
    });

    return {
        html
    }
}

export default controller;