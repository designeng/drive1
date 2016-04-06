import carcass              from 'drive-templates/build/carcass';
import head                 from 'drive-templates/build/head';
import body                 from 'drive-templates/build/body';

import citySelector         from 'drive-templates/build/citySelector';
import additionalNav        from 'drive-templates/build/additionalNav';
import bottomScripts        from 'drive-templates/build/bottomScripts';

import footer               from 'drive-templates/build/footer';
import header               from 'drive-templates/build/header';
import keywords             from 'drive-templates/build/keywords';
import logo                 from 'drive-templates/build/logo';
import mobileMenuTrigger    from 'drive-templates/build/mobileMenuTrigger';
import mobileNav            from 'drive-templates/build/mobileNav';
import nav                  from 'drive-templates/build/nav';
import topControls          from 'drive-templates/build/topControls';
import brandsList           from 'drive-templates/build/brandsList';

import sprite               from 'drive-templates/build/partials/sprite';
import backgroundSprite     from 'drive-templates/build/partials/backgroundSprite';
import hr                   from 'drive-templates/build/partials/hr';
import ins                  from 'drive-templates/build/partials/ins';

import registerPartials from '../../utils/handlebars/registerPartials';

registerPartials({
    'sprite': sprite,
    'backgroundSprite': backgroundSprite,
    'ins': ins,
    'hr': hr
});

const headerHtml = (cities) => {
    return header({
        topControls: topControls(),
        logo: logo(),
        citySelector: citySelector(cities),
        nav: nav()
    })
}

function getCarcass(brands, cities) {

    const getCarcassFn = (pageContentHtml) => {
        return carcass({
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
                bottomScripts: bottomScripts()
            })
        })
    }

    return getCarcassFn;
}

export default getCarcass;