import carcass              from '../../templates/build/carcass';
import head                 from '../../templates/build/head';
import body                 from '../../templates/build/body';

import citySelector         from '../../templates/build/citySelector';
import additionalNav        from '../../templates/build/additionalNav';
import bottomScripts        from '../../templates/build/bottomScripts';

import footer               from '../../templates/build/footer';
import header               from '../../templates/build/header';
import keywords             from '../../templates/build/keywords';
import logo                 from '../../templates/build/logo';
import mobileMenuTrigger    from '../../templates/build/mobileMenuTrigger';
import mobileNav            from '../../templates/build/mobileNav';
import nav                  from '../../templates/build/nav';
import topControls          from '../../templates/build/topControls';
import brandsList           from '../../templates/build/brandsList';

import additionalStyles     from '../../templates/build/partials/additionalStyles';
import sprite               from '../../templates/build/partials/sprite';
import backgroundSprite     from '../../templates/build/partials/backgroundSprite';
import hr                   from '../../templates/build/partials/hr';
import ins                  from '../../templates/build/partials/ins';

import registerPartials from '../../utils/handlebars/registerPartials';

registerPartials({
    additionalStyles,
    sprite,
    backgroundSprite,
    ins,
    hr
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

    const getCarcassFn = (pageContentHtml, styles) => {
        return carcass({
            htmlClass: '',
            head: head(
                styles
            ),
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