import carcass from '../../templates/build/carcass';
import head from '../../templates/build/head';
import body from '../../templates/build/body';

import citySelector from '../../templates/build/citySelector';
import additionalNav from '../../templates/build/additionalNav';
import scrollToTopButton from '../../templates/build/scrollToTopButton';
import bottomScripts from '../../templates/build/bottomScripts';
import socialShareBlock from '../../templates/build/socialShareBlock';

import footer from '../../templates/build/footer';
import header from '../../templates/build/header';
import logo from '../../templates/build/logo';
import mobileMenuTrigger from '../../templates/build/mobileMenuTrigger';
import mobileNav from '../../templates/build/mobileNav';
import nav from '../../templates/build/nav';
import topControls from '../../templates/build/topControls';
import brandsList from '../../templates/build/brandsList';

import widget_adfoxTopMobile from '../../templates/build/widgets/widget_adfoxTopMobile';
import widget_adfoxMiddleMobile from '../../templates/build/widgets/widget_adfoxMiddleMobile';
import widget_adfoxTop from '../../templates/build/widgets/widget_adfoxTop';
import widget_adfoxSiteHeader from '../../templates/build/widgets/widget_adfoxSiteHeader';
import widget_yandexMetrika from '../../templates/build/widgets/widget_yandexMetrika';
import widget_yandexShare from '../../templates/build/widgets/widget_yandexShare';
import widget_teasers from '../../templates/build/widgets/widget_teasers';
import widget_relap from '../../templates/build/widgets/widget_relap';
import widget_adriver from '../../templates/build/widgets/widget_adriver';
import widget_adfoxVideo from '../../templates/build/widgets/widget_adfoxVideo';
import widget_adfoxButton from '../../templates/build/widgets/widget_adfoxButton';
import widget_adfoxBottomMobile from '../../templates/build/widgets/widget_adfoxBottomMobile';
import widget_adfoxBottom from '../../templates/build/widgets/widget_adfoxBottom';

import sprite from '../../templates/build/partials/sprite';
import backgroundSprite from '../../templates/build/partials/backgroundSprite';
import hr from '../../templates/build/partials/hr';
import ins from '../../templates/build/partials/ins';

import registerPartials from '../../utils/handlebars/registerPartials';

import packageJson from '../../../package.json';

registerPartials({
    widget_adfoxTopMobile,
    widget_adfoxMiddleMobile,
    widget_adfoxBottomMobile,
    widget_adfoxTop,
    widget_adfoxBottom,
    widget_adfoxSiteHeader,
    widget_yandexMetrika,
    widget_yandexShare,
    widget_teasers,
    widget_adriver,
    widget_relap,
    widget_adfoxVideo,
    widget_adfoxButton,
    sprite,
    backgroundSprite,
    ins,
    hr
});

const headerHtml = (cities, receptionButtons) => {
    return header({
        topControls: topControls({
            receptionButtons
        }),
        logo: logo(),
        citySelector: citySelector({
            cities
        }),
        nav: nav()
    })
}

function getCarcass(brands, cities, receptionButtons) {
    const defaultHeadScripts = [
        {
            async: 'async',
            src: 'https://relap.io/api/v6/head.js?token=kuqS-X35GGSZrxwZ'
        }
    ];

    const defaultKeywords = '';
    const defaultDescription = 'Автомобильные новости, тест-драйвы с видео и фото. Каталог машин с описанием и ценами. Отзывы владельцев авто.';
    const defaultTitle = 'ДРАЙВ';

    const getCarcassFn = (
        pageContentHtml,
        additionalStyles,
        additionalHeadScripts = defaultHeadScripts,
        additionalBottomScripts = [],
        optionalBlocks = {},
        seo = {
            keywords: defaultKeywords,
            description: defaultDescription,
            title: defaultTitle
        }
    ) => {
        return carcass({
            htmlClass: '',
            head: head({
                title: seo.title,
                additionalStyles,
                additionalHeadScripts,
                keywords: seo.keywords,
                description: seo.description,
                cacheReset: packageJson.version,
            }),
            body: body({
                mobileMenuTrigger: mobileMenuTrigger(),
                header: headerHtml(cities, receptionButtons),
                mobileNav: mobileNav({
                    brands
                }),
                additionalNav: additionalNav(),
                brandsList: brandsList({
                    brands
                }),
                page: pageContentHtml,
                footer: footer({
                    scrollToTopButton: scrollToTopButton()
                }),
                bottomScripts: bottomScripts(),
                additionalBottomScripts,
                compareBlock: optionalBlocks.compareBlock,
                socialShareBlock: socialShareBlock(),
            })
        })
    };

    return getCarcassFn;
}

export default getCarcass;