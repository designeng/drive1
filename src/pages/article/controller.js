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

import articlePageContent   from 'drive-templates/build/pages/article';

import articleHeader        from 'drive-templates/build/partials/articleHeader';
import articleMeta          from 'drive-templates/build/partials/articleMeta';
import articleTitle         from 'drive-templates/build/partials/articleTitle';
import brandedArticleHeader from 'drive-templates/build/partials/brandedArticleHeader';
import hr                   from 'drive-templates/build/partials/hr';

import registerPartials from '../../utils/handlebars/registerPartials';

registerPartials({
    'articleHeader': articleHeader,
    'articleMeta': articleMeta,
    'articleTitle': articleTitle,
    'brandedArticleHeader': brandedArticleHeader,
    'hr': hr
});

const composePageContentHtml = () => {
    return articlePageContent({
        
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

function controller(article, brands, cities, articleId) {


    let pageContentHtml = composePageContentHtml(
        
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

// console.log(chalk.green("article:::::", JSON.stringify(article), articleId));